import { prisma } from "@/lib/prisma";

export async function toggleStudioActive(id: string) {
  const studio = await prisma.studio.findUnique({ where: { id } });
  if (!studio) throw new Error("Studio not found");

  const newStatus = !studio.isActive;

  // Cascade the active status to the owner
  await prisma.$transaction([
    prisma.studio.update({
      where: { id },
      data: { isActive: newStatus },
    }),
    prisma.user.update({
      where: { id: studio.ownerId },
      data: { isActive: newStatus },
    }),
  ]);

  return newStatus;
}
