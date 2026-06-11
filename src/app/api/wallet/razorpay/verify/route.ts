import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { WalletStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "STUDIO") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Process the successful payment in a transaction
    const transaction = await prisma.$transaction(async (tx) => {
      // Verify if transaction already exists to prevent duplicate processing
      const existingTx = await tx.walletTransaction.findFirst({
        where: { referenceNumber: razorpay_payment_id }
      });

      if (existingTx) {
        return existingTx;
      }

      // Create wallet transaction as APPROVED directly
      const walletTx = await tx.walletTransaction.create({
        data: {
          amount: parseFloat(amount),
          referenceNumber: razorpay_payment_id,
          studioId: session.user.studioId!,
          status: WalletStatus.APPROVED,
        },
      });

      // Credit the studio balance
      await tx.studio.update({
        where: { id: session.user.studioId! },
        data: {
          balance: {
            increment: parseFloat(amount),
          },
        },
      });

      return walletTx;
    });

    return NextResponse.json({ success: true, transaction });
  } catch (error) {
    console.error("Razorpay Verify Error:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
