import { prisma } from "@/lib/prisma";

export async function createMagicLink(data: { name: string; studioId: string }) {
  return prisma.magicLink.create({
    data,
  });
}

export async function getMagicLinksByStudio(studioId: string) {
  return prisma.magicLink.findMany({
    where: { studioId },
    include: {
      album: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getMagicLinkById(id: string) {
  return prisma.magicLink.findUnique({
    where: { id },
    include: {
      album: true,
      studio: true,
    },
  });
}

export async function updateMagicLinkAlbum(id: string, studioId: string, albumId: string | null) {
  // Verify ownership
  const magicLink = await prisma.magicLink.findUnique({
    where: { id, studioId },
  });

  if (!magicLink) {
    throw new Error("Magic Link not found or unauthorized");
  }

  // If albumId is provided, verify it belongs to the studio and is a magic album
  if (albumId) {
    const album = await prisma.album.findUnique({
      where: { id: albumId, studioId, isMagic: true },
    });

    if (!album) {
      throw new Error("Invalid album selection");
    }
  }

  return prisma.magicLink.update({
    where: { id },
    data: { albumId },
  });
}

export async function deleteMagicLink(id: string, studioId: string) {
  return prisma.magicLink.delete({
    where: { id, studioId },
  });
}
