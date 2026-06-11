import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Razorpay from "razorpay";

// Lazy-initialize Razorpay to prevent build-time crashes when env vars are missing
let razorpayInstance: Razorpay | null = null;

function getRazorpay() {
  if (!razorpayInstance) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    // Provide fallback only to prevent constructor throwing during build evaluation if ever invoked
    razorpayInstance = new Razorpay({
      key_id: keyId || "placeholder_key",
      key_secret: keySecret || "placeholder_secret",
    });
  }
  return razorpayInstance;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "STUDIO") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount } = await req.json();

    if (!amount || amount < 1) {
      return NextResponse.json(
        { error: "Valid amount is required (Minimum ₹1)" },
        { status: 400 }
      );
    }

    // Razorpay amount is in paise (multiply by 100)
    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `rcpt_${session.user.studioId?.substring(0, 8)}_${Date.now()}`,
    };

    const order = await getRazorpay().orders.create(options);

    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    console.error("Razorpay Create Order Error:", error);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}
