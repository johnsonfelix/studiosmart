import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { processTransaction } from "@/services/wallet.service";
import { WalletStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { transactionId, status } = await req.json();

    if (!transactionId || !status) {
      return NextResponse.json(
        { error: "Transaction ID and Status are required" },
        { status: 400 }
      );
    }

    if (!Object.values(WalletStatus).includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const transaction = await processTransaction(transactionId, status);

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error("Wallet Process Error:", error);
    return NextResponse.json(
      { error: "Failed to process transaction" },
      { status: 500 }
    );
  }
}
