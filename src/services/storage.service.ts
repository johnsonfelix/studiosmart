import { prisma } from "@/lib/prisma";
import { deleteS3Objects } from "@/lib/s3";
export async function deleteAlbumPhotos(albumId: string) {
  const photos = await prisma.photo.findMany({
    where: { albumId },
    select: { previewUrl: true, thumbnailUrl: true, originalUrl: true },
  });

  const keysToDelete: string[] = [];

  for (const photo of photos) {
    if (photo.previewUrl && !photo.previewUrl.startsWith("http")) keysToDelete.push(photo.previewUrl);
    if (photo.thumbnailUrl && !photo.thumbnailUrl.startsWith("http")) keysToDelete.push(photo.thumbnailUrl);
    if (photo.originalUrl && !photo.originalUrl.startsWith("http")) keysToDelete.push(photo.originalUrl);
  }

  if (keysToDelete.length > 0) {
    await deleteS3Objects(keysToDelete);
  }
}
