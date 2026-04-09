import { prisma } from "@/lib/prisma";

export async function toggleSelection(
  photoId: string,
  clientId: string,
  isSelected: boolean | null
) {
  if (isSelected === null) {
    return prisma.selection.deleteMany({
      where: {
        photoId,
        clientId,
      },
    });
  }

  return prisma.selection.upsert({
    where: {
      photoId_clientId: {
        photoId,
        clientId,
      },
    },
    update: {
      isSelected,
    },
    create: {
      photoId,
      clientId,
      isSelected,
    },
  });
}

export async function getSelectedPhotos(albumId: string) {
  return prisma.selection.findMany({
    where: {
      photo: { albumId },
      isSelected: true,
    },
    include: {
      photo: true,
      client: true,
    },
    orderBy: {
      photo: {
        fileName: "asc",
      },
    },
  });
}
