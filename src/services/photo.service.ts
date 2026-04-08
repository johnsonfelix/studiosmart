import { prisma } from "@/lib/prisma";
import { generatePresignedGetUrl } from "@/lib/s3";
import { PaginatedResponse, PhotoWithSelection } from "@/types";

export async function getPhotosByAlbum(
  albumId: string,
  page: number = 1,
  limit: number = 24,
  clientId?: string
): Promise<PaginatedResponse<PhotoWithSelection>> {
  const offset = (page - 1) * limit;

  const [photos, total] = await Promise.all([
    prisma.photo.findMany({
      where: { albumId },
      skip: offset,
      take: limit,
      orderBy: { fileName: "asc" },
      include: clientId
        ? {
            selections: {
              where: { clientId },
            },
          }
        : undefined,
    }),
    prisma.photo.count({ where: { albumId } }),
  ]);

  const items = await Promise.all(
    photos.map(async (photo: any) => {
      const isSelected = clientId
        ? photo.selections?.[0]?.isSelected ?? false
        : false;

      return {
        ...photo,
        previewUrl: (await generatePresignedGetUrl(photo.previewUrl)) || "",
        thumbnailUrl: (await generatePresignedGetUrl(photo.thumbnailUrl)) || "",
        originalUrl: await generatePresignedGetUrl(photo.originalUrl),
        isSelected,
      };
    })
  );

  return {
    items,
    total,
    page,
    limit,
    hasMore: offset + photos.length < total,
  };
}

export async function createPhoto(data: {
  albumId: string;
  fileName: string;
  previewUrl: string;
  thumbnailUrl: string;
  originalUrl?: string;
  width?: number;
  height?: number;
  fileSize?: number;
}) {
  return prisma.photo.create({
    data: {
      albumId: data.albumId,
      fileName: data.fileName,
      previewUrl: data.previewUrl,
      thumbnailUrl: data.thumbnailUrl,
      originalUrl: data.originalUrl,
      width: data.width || 0,
      height: data.height || 0,
      fileSize: data.fileSize || 0,
    },
  });
}
