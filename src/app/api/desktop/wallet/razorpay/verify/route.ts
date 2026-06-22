import { NextResponse } from "next/server";
import { verifyDesktopAuth } from "@/lib/desktop-auth";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { WalletStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const authResult = await verifyDesktopAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !amount) {
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

    const transaction = await prisma.$transaction(async (tx) => {
      const existingTx = await tx.walletTransaction.findFirst({
        where: { referenceNumber: razorpay_payment_id }
      });

      if (existingTx) return existingTx;

      const walletTx = await tx.walletTransaction.create({
        data: {
          amount: parseFloat(amount),
          referenceNumber: razorpay_payment_id,
          studioId: authResult.studioId,
          status: WalletStatus.APPROVED,
        },
      });

      await tx.studio.update({
        where: { id: authResult.studioId },
        data: { balance: { increment: parseFloat(amount) } },
      });

      return walletTx;
    });

    return NextResponse.json({ success: true, transaction });
  } catch (error) {
    console.error("Razorpay Verify Error:", error);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
