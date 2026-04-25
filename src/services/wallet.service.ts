import { prisma } from "@/lib/prisma";
import { WalletStatus } from "@prisma/client";

export async function getStudioBalance(studioId: string) {
  const studio = await prisma.studio.findUnique({
    where: { id: studioId },
    select: { balance: true },
  });
  return studio?.balance || 0;
}

export async function createDepositRequest(data: {
  amount: number;
  referenceNumber: string;
  studioId: string;
}) {
  return prisma.walletTransaction.create({
    data: {
      ...data,
      status: WalletStatus.PENDING,
    },
  });
}

export async function getStudioTransactions(studioId: string) {
  return prisma.walletTransaction.findMany({
    where: { studioId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllPendingTransactions() {
  return prisma.walletTransaction.findMany({
    where: { status: WalletStatus.PENDING },
    include: {
      studio: {
        select: {
          name: true,
          owner: {
            select: { name: true, email: true },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function processTransaction(
  transactionId: string,
  status: WalletStatus
) {
  return prisma.$transaction(async (tx) => {
    const transaction = await tx.walletTransaction.update({
      where: { id: transactionId },
      data: { status },
    });

    if (status === WalletStatus.APPROVED) {
      await tx.studio.update({
        where: { id: transaction.studioId },
        data: {
          balance: {
            increment: transaction.amount,
          },
        },
      });
    }

    return transaction;
  });
}

export async function getTotalReceivedAmount() {
  const result = await prisma.walletTransaction.aggregate({
    where: { status: WalletStatus.APPROVED },
    _sum: {
      amount: true,
    },
  });
  return result._sum.amount || 0;
}

export async function deductStudioBalance(
  studioId: string,
  amount: number,
  tx?: any
) {
  const prismaClient = tx || prisma;

  // Check balance first
  const studio = await prismaClient.studio.findUnique({
    where: { id: studioId },
    select: { balance: true },
  });

  if (!studio || studio.balance < amount) {
    throw new Error(
      "Insufficient balance in your wallet. Please add funds to continue."
    );
  }

  return prismaClient.studio.update({
    where: { id: studioId },
    data: {
      balance: {
        decrement: amount,
      },
    },
  });
}

export async function getRecentTransactions(limit: number = 20) {
  return prisma.walletTransaction.findMany({
    take: limit,
    include: {
      studio: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
