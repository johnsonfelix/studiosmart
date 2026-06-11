"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function createInviteAction(data: {
  templateId: string;
  groomName: string;
  brideName: string;
  weddingDate?: Date;
  storyText?: string;
  heroImageUrl?: string;
  isPaid?: boolean;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const invite = await prisma.digitalInvite.create({
      data: {
        userId: session.user.id,
        templateId: data.templateId,
        groomName: data.groomName,
        brideName: data.brideName,
        weddingDate: data.weddingDate,
        storyText: data.storyText,
        heroImageUrl: data.heroImageUrl,
        paymentStatus: data.isPaid ? "PAID" : "PENDING",
      },
    });

    return { success: true, inviteId: invite.id };
  } catch (error) {
    console.error("Failed to create invite:", error);
    return { success: false, error: "Failed to create invite" };
  }
}
