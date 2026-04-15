import { prisma } from "@/lib/prisma";
import { generateAccessToken } from "@/lib/utils";
import { AlbumWithCounts } from "@/types";

export async function createAlbum(
  data: {
    title: string;
    studioId: string;
    clientId: string;
    isMagic?: boolean;
  },
  tx?: any
) {
  const prismaClient = tx || prisma;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 180);

  return prismaClient.album.create({
    data: {
      ...data,
      accessToken: generateAccessToken(),
      expiresAt,
    },
  });
}

export async function getAlbumsByStudio(
  studioId: string,
  isMagic: boolean = false
): Promise<AlbumWithCounts[]> {
  const albums = await prisma.album.findMany({
    where: { studioId, isMagic },
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
      magicRegistrations: {
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: { photos: true, magicRegistrations: true },
      },
    },
  });
}

export async function getAlbumByToken(accessToken: string, limit: number = 50) {
  const album = await prisma.album.findFirst({
    where: { accessToken, isActive: true },
    include: {
      studio: { select: { id: true, name: true } },
      client: { select: { id: true, name: true, phone: true } },
      _count: { select: { photos: true } }
    },
  });

  if (!album) return null;

  // 1. Fetch ALL selection statuses for this client in this album (optimized query)
  // This is needed to maintain accurate counts in the UI header
  const selections = await prisma.selection.findMany({
    where: {
      clientId: album.clientId,
      photo: { albumId: album.id }
    },
    select: { photoId: true, isSelected: true }
  });

  // 2. Fetch initial batch of photos
  const photos = await prisma.photo.findMany({
    where: { albumId: album.id },
    orderBy: { fileName: "asc" },
    take: limit,
  });

  // Create a selection map for fast lookup
  const selectionMap: Record<string, "selected" | "rejected" | "unreviewed"> = {};
  selections.forEach((s) => {
    selectionMap[s.photoId] = s.isSelected ? "selected" : "rejected";
  });

  // Transform initial photos to include selection status
  const photosWithSelection = photos.map((photo) => ({
    ...photo,
    selectionStatus: selectionMap[photo.id] || "unreviewed",
  }));

  return {
    ...album,
    photos: photosWithSelection,
    selectionMap,
    totalPhotos: album._count.photos,
  };
}

export async function getPaginatedAlbumPhotos(
  albumId: string,
  clientId: string,
  page: number = 1,
  limit: number = 50
) {
  const skip = (page - 1) * limit;
  const photos = await prisma.photo.findMany({
    where: { albumId },
    orderBy: { fileName: "asc" },
    skip,
    take: limit,
    include: {
      selections: {
        where: { clientId },
      },
    },
  });

  return photos.map((photo) => {
    const selection = photo.selections[0];
    return {
      ...photo,
      selectionStatus: selection
        ? selection.isSelected ? "selected" : "rejected"
        : "unreviewed",
    };
  });
}

export async function deleteAlbum(id: string) {
  return prisma.album.delete({
    where: { id },
  });
}
