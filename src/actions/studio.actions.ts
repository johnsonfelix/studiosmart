"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const UpdateStudioSchema = z.object({
  studioName: z.string().min(2, "Studio name must be at least 2 characters"),
  ownerName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
});

export async function updateStudioSettings(formData: FormData) {
  const session = await auth();

  if (!session?.user || session.user.role !== "STUDIO" || !session.user.studioId) {
    return { error: "Unauthorized" };
  }

  const validatedFields = UpdateStudioSchema.safeParse({
    studioName: formData.get("studioName"),
    ownerName: formData.get("ownerName"),
    phone: formData.get("phone"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const { studioName, ownerName, phone } = validatedFields.data;

  try {
    await prisma.$transaction([
      prisma.studio.update({
        where: { id: session.user.studioId },
        data: { name: studioName },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { 
          name: ownerName,
          phone: phone,
        },
      }),
    ]);

    revalidatePath("/studio/settings");
    return { success: "Settings updated successfully" };
  } catch (error) {
    console.error("Update studio error:", error);
    return { error: "Failed to update settings" };
  }
}
