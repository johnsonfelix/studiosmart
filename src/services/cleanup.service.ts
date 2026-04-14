import { prisma } from "@/lib/prisma";
import { deleteAlbumPhotos } from "./storage.service";
import { deleteAlbum } from "./album.service";

/**
 * Automatically cleans up expired albums from both S3 and the database.
 * Usually triggered by a cron job via an API route.
 */
export async function cleanupExpiredAlbums() {
  const now = new Date();
  
  // 1. Find all expired albums
  // We include albums where expiresAt is less than or equal to now
  const expiredAlbums = await prisma.album.findMany({
    where: {
      expiresAt: {
        lte: now
      }
    },
    select: {
      id: true,
      title: true
    }
  });

  if (expiredAlbums.length === 0) {
    return { count: 0, message: "No expired albums found for cleanup." };
  }

  console.log(`[Cleanup] Found ${expiredAlbums.length} expired albums. Starting cleanup...`);

  const results = [];
  
  for (const album of expiredAlbums) {
    try {
      // First, delete all photos from S3
      await deleteAlbumPhotos(album.id);
      
      // Then, delete the album record from DB (this cascades to photos and selections)
      await deleteAlbum(album.id);
      
      results.push({ id: album.id, title: album.title, success: true });
      console.log(`[Cleanup] Successfully deleted album: ${album.title} (${album.id})`);
    } catch (error: any) {
      console.error(`[Cleanup] Failed to delete album ${album.id}:`, error);
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
