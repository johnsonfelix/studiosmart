import { prisma } from "@/lib/prisma";

export async function toggleUserActive(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { studio: true },
  });

  if (!user) throw new Error("User not found");
  if (user.role === "ADMIN") throw new Error("Cannot deactivate admin users");

  const newStatus = !user.isActive;

  const queries: any[] = [
    prisma.user.update({
      where: { id },
      data: { isActive: newStatus },
    }),
  ];

  if (user.studio) {
    queries.push(
      prisma.studio.update({
        where: { id: user.studio.id },
        data: { isActive: newStatus },
      })
    );
  }

  await prisma.$transaction(queries);
  return newStatus;
}
