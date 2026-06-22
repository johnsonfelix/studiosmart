import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { WalletStatus } from "@prisma/client";

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET!;

    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const album = await prisma.album.findUnique({
      where: { accessToken: token },
      include: { studio: true }
    });

    if (!album || !album.isActive) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    if (album.isPaid) {
       return NextResponse.json({ success: true, message: "Already paid" });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Mark album as paid
      await tx.album.update({
        where: { id: album.id },
        data: {
          isPaid: true,
          paymentId: razorpay_payment_id,
        }
      });

      // 2. Add money to studio wallet
      const existingTx = await tx.walletTransaction.findFirst({
        where: { referenceNumber: razorpay_payment_id }
      });

      if (!existingTx) {
        await tx.walletTransaction.create({
          data: {
            amount: album.price || 0,
            referenceNumber: razorpay_payment_id,
            studioId: album.studioId,
            status: WalletStatus.APPROVED,
          },
        });

        await tx.studio.update({
          where: { id: album.studioId },
          data: { balance: { increment: album.price || 0 } },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Razorpay Verify Error:", error);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
