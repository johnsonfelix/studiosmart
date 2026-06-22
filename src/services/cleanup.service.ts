import { prisma } from "@/lib/prisma";
import { deleteAlbum } from "./album.service";
import { deleteS3Objects } from "@/lib/s3";
import { DeleteCollectionCommand } from "@aws-sdk/client-rekognition";
import { rekognitionClient } from "@/lib/rekognition";

/**
 * Automatically cleans up expired albums from both S3 and the database.
 * Usually triggered by a cron job via an API route.
 */
export async function cleanupExpiredAlbums() {
  const now = new Date();
  
  // 1. Find all expired albums
  // Include all necessary assets to purge S3 and Rekognition
  const expiredAlbums = await prisma.album.findMany({
    where: {
      expiresAt: {
        lte: now
      }
    },
    include: {
      photos: { select: { originalUrl: true, previewUrl: true, thumbnailUrl: true } },
      magicRegistrations: { select: { selfieUrl: true } }
    }
  });

  if (expiredAlbums.length === 0) {
    return { count: 0, message: "No expired albums found for cleanup." };
  }

  console.log(`[Cleanup] Found ${expiredAlbums.length} expired albums. Starting deep purge...`);

  const results = [];
  
  for (const album of expiredAlbums) {
    try {
      console.log(`[Cleanup] Purging album: ${album.title} (${album.id})`);

      // 2. Collect all S3 keys associated with this album
      const s3Keys: string[] = [];
      album.photos.forEach((p) => {
        if (p.originalUrl) s3Keys.push(p.originalUrl);
        if (p.previewUrl) s3Keys.push(p.previewUrl);
        if (p.thumbnailUrl) s3Keys.push(p.thumbnailUrl);
      });
      album.magicRegistrations.forEach((r) => {
        if (r.selfieUrl) s3Keys.push(r.selfieUrl);
      });

      // 3. Batch delete from S3
      if (s3Keys.length > 0) {
        const batchSize = 1000;
        for (let i = 0; i < s3Keys.length; i += batchSize) {
          await deleteS3Objects(s3Keys.slice(i, i + batchSize));
        }
        console.log(`[Cleanup] Deleted ${s3Keys.length} objects from S3 for album ${album.id}`);
      }

      // 4. Delete AWS Rekognition Collection
      // We try this for all albums just in case they have a stray collection, but especially if isMagic
      try {
        await rekognitionClient.send(new DeleteCollectionCommand({ CollectionId: album.id }));
        console.log(`[Cleanup] Deleted AWS Rekognition collection for album ${album.id}`);
      } catch (err: any) {
        // If collection doesn't exist, it will throw ResourceNotFoundException which we can safely ignore
        if (err.name !== 'ResourceNotFoundException') {
          console.warn(`[Cleanup] Warning: Could not delete Rekognition collection for ${album.id}:`, err.message);
        }
      }

      // 5. Delete the album record from DB (this cascades to photos, registrations, selections, etc)
      await deleteAlbum(album.id);
      
      results.push({ id: album.id, title: album.title, success: true });
      console.log(`[Cleanup] Successfully fully purged album: ${album.title} (${album.id})`);
    } catch (error: any) {
      console.error(`[Cleanup] Failed to fully purge album ${album.id}:`, error);
      results.push({ id: album.id, title: album.title, success: false, error: error.message });
    }
  }

  return {
    success: true,
    count: results.filter(r => r.success).length,
    total: expiredAlbums.length,
    results
  };
}
