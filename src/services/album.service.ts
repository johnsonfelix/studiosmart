import { prisma } from "@/lib/prisma";
import { generateAccessToken } from "@/lib/utils";
import { AlbumWithCounts } from "@/types";

export async function createAlbum(
  data: {
    title: string;
    studioId: string;
    clientId: string;
  },
  tx?: any
) {
  const prismaClient = tx || prisma;
  return prismaClient.album.create({
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
        select: { id: true, name: true, phone: true },
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
      photos: {
        orderBy: { fileName: "asc" },
      },
      _count: {
        select: { photos: true },
      },
    },
  });
}

export async function getAlbumByToken(accessToken: string) {
  const album = await prisma.album.findUnique({
    where: { accessToken, isActive: true },
    include: {
      studio: { select: { id: true, name: true } },
      client: { select: { id: true, name: true, phone: true } },
      photos: {
        orderBy: { fileName: "asc" },
        include: {
          selections: true,
        },
      },
    },
  });

  if (!album) return null;

  // Transform photos to include selection status for this specific client
  const photosWithSelection = album.photos.map((photo) => {
    const selection = photo.selections.find((s) => s.clientId === album.clientId);
    return {
      ...photo,
      selectionStatus: selection
        ? selection.isSelected
          ? ("selected" as const)
          : ("rejected" as const)
        : ("unreviewed" as const),
    };
  });

  return { ...album, photos: photosWithSelection };
}

export async function deleteAlbum(id: string) {
  return prisma.album.delete({
    where: { id },
  });
}
