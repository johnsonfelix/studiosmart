import { NextResponse } from "next/server";
import { verifyDesktopAuth } from "@/lib/desktop-auth";
import { getStudioBalance, getStudioTransactions, createDepositRequest } from "@/services/wallet.service";

export async function GET(req: Request) {
  try {
    const authResult = await verifyDesktopAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    const [balance, transactions] = await Promise.all([
      getStudioBalance(authResult.studioId),
      getStudioTransactions(authResult.studioId),
    ]);

    return NextResponse.json({ balance, transactions });
  } catch (error) {
    console.error("Desktop Wallet Error:", error);
    return NextResponse.json({ error: "Failed to fetch wallet data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authResult = await verifyDesktopAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    const { amount, referenceNumber } = await req.json();

    if (!amount || !referenceNumber) {
      return NextResponse.json({ error: "Amount and Reference Number are required" }, { status: 400 });
    }

    const transaction = await createDepositRequest({
      amount: parseFloat(amount),
      referenceNumber,
      studioId: authResult.studioId,
    });

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error("Desktop Wallet Deposit Error:", error);
    return NextResponse.json({ error: "Failed to submit deposit request" }, { status: 500 });
  }
}
