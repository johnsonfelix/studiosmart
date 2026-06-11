import { NextResponse } from "next/server";
import { verifyDesktopAuth } from "@/lib/desktop-auth";
import { prisma } from "@/lib/prisma";
import { indexFaceForPhoto } from "@/services/rekognition.service";

// Allow up to 5 minutes for large uploads
export const maxDuration = 300;

const DB_BATCH_SIZE = 50; // Insert photos in batches to avoid transaction timeout

export async function POST(req: Request) {
  try {
    const authResult = await verifyDesktopAuth(req);

    if (authResult instanceof NextResponse) {
      return authResult; // Unauthorized
    }

    const { albumId, photos } = await req.json();

    if (!albumId || !photos || !Array.isArray(photos)) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    // Verify album belongs to studio
    const album = await prisma.album.findFirst({
      where: { id: albumId, studioId: authResult.studioId }
    });

    if (!album) {
      return NextResponse.json({ error: "Album not found or unauthorized" }, { status: 404 });
    }

    // Save photos to database using a single highly-optimized bulk insert
    // Prisma's createManyAndReturn works exceptionally well for hundreds/thousands of records
    const allResults = await prisma.photo.createManyAndReturn({
      data: photos.map((p: any) => ({
        albumId,
        fileName: p.fileName,
        previewUrl: p.keys.preview,
        thumbnailUrl: p.keys.thumbnail,
        originalUrl: p.keys.original,
        fileSize: p.fileSize,
        width: p.width || 0,
        height: p.height || 0,
      })),
      skipDuplicates: true, // Prevents failure if a file was accidentally duplicated
    });

    // 2. If it's a magic album, trigger face indexing SYNCHRONOUSLY
    if (album.isMagic) {
      console.log(`Indexing faces for ${allResults.length} photos in album ${albumId}`);
      
      // Set indexing status to true
      await prisma.album.update({
        where: { id: albumId },
        data: { isIndexing: true }
      });

      // Process in chunks of 5 to avoid AWS rate limits while staying fast
      try {
        const CHUNK_SIZE = 5;
        for (let i = 0; i < allResults.length; i += CHUNK_SIZE) {
          const chunk = allResults.slice(i, i + CHUNK_SIZE);
          await Promise.all(
            chunk.map(async (p) => {
              if (p.originalUrl) {
                await indexFaceForPhoto(p.id, albumId, p.originalUrl);
              }
            })
          );
        }
      } catch (err) {
        console.error("Face indexing error:", err);
      } finally {
        await prisma.album.update({
          where: { id: albumId },
          data: { isIndexing: false }
        });
      }
    }

    return NextResponse.json({ success: true, count: allResults.length });
  } catch (error) {
    console.error("Desktop Photo Confirm Error:", error);
    return NextResponse.json({ error: "Failed to save photos" }, { status: 500 });
  }
}
