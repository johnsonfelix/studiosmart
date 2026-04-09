import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createDepositRequest } from "@/services/wallet.service";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "STUDIO") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, referenceNumber } = await req.json();

    if (!amount || !referenceNumber) {
      return NextResponse.json(
        { error: "Amount and Reference Number are required" },
        { status: 400 }
      );
    }

    const transaction = await createDepositRequest({
      amount: parseFloat(amount),
      referenceNumber,
      studioId: session.user.studioId!,
    });

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error("Wallet Deposit Error:", error);
    return NextResponse.json(
      { error: "Failed to submit deposit request" },
      { status: 500 }
    );
  }
}
