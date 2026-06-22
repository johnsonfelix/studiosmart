import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";

let razorpayInstance: Razorpay | null = null;

function getRazorpay() {
  if (!razorpayInstance) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    razorpayInstance = new Razorpay({
      key_id: keyId || "placeholder_key",
      key_secret: keySecret || "placeholder_secret",
    });
  }
  return razorpayInstance;
}

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const album = await prisma.album.findUnique({
      where: { accessToken: token }
    });

    if (!album || !album.isActive) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    if (!album.requirePayment) {
      return NextResponse.json({ error: "Album does not require payment" }, { status: 400 });
    }

    if (album.isPaid) {
      return NextResponse.json({ error: "Album is already paid" }, { status: 400 });
    }

    if (!album.price || album.price < 1) {
      return NextResponse.json({ error: "Invalid album price" }, { status: 400 });
    }

    const options = {
      amount: Math.round(album.price * 100),
      currency: "INR",
      receipt: `rcpt_album_${album.id.substring(0, 8)}_${Date.now()}`,
    };

    const order = await getRazorpay().orders.create(options);
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;

    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId });
  } catch (error) {
    console.error("Razorpay Create Order Error:", error);
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
  }
}
