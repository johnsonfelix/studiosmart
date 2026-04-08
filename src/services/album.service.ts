import { prisma } from "@/lib/prisma";
import { generateAccessToken } from "@/lib/utils";
import { AlbumWithCounts } from "@/types";

export async function createAlbum(data: {
  title: string;
  studioId: string;
  clientId: string;
}) {
  return prisma.album.create({
    data: {
      ...data,
      accessToken: generateAccessToken(),
    },
  });
}

export async function getAlbumsByStudio(
  studioId: string
): Promise<AlbumWithCounts[]> {
  const albums = await prisma.album.findMany({
    where: { studioId },
    include: {
      _count: {
        select: { photos: true },
      },
      client: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return albums as unknown as AlbumWithCounts[];
}

export async function getAlbumById(id: string, studioId?: string) {
  return prisma.album.findUnique({
    where: {
      id,
      ...(studioId && { studioId }),
    },
    include: {
      client: true,
      studio: true,
      _count: {
        select: { photos: true },
      },
    },
  });
}

export async function getAlbumByToken(accessToken: string) {
  return prisma.album.findUnique({
    where: { accessToken, isActive: true },
    include: {
      studio: { select: { id: true, name: true } },
      client: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function deleteAlbum(id: string) {
  return prisma.album.delete({
    where: { id },
  });
}
