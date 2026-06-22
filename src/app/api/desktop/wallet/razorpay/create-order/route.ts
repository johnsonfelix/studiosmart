import { NextResponse } from "next/server";
import { verifyDesktopAuth } from "@/lib/desktop-auth";
import Razorpay from "razorpay";

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

export async function POST(req: Request) {
  try {
    const authResult = await verifyDesktopAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    const { amount } = await req.json();

    if (!amount || amount < 1) {
      return NextResponse.json({ error: "Valid amount is required (Minimum ₹1)" }, { status: 400 });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `rcpt_${authResult.studioId?.substring(0, 8)}_${Date.now()}`,
    };

    const order = await getRazorpay().orders.create(options);

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;

    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId });
  } catch (error) {
    console.error("Razorpay Create Order Error:", error);
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
  }
}
