import { NextResponse } from "next/server";
import { verifyDesktopAuth } from "@/lib/desktop-auth";
import { prisma } from "@/lib/prisma";
import { indexFaceForPhoto } from "@/services/rekognition.service";

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

    // Save photos to database using a transaction or creating them one by one to get IDs
    // 1. Save photos to database first
    const results = await prisma.$transaction(async (tx) => {
      return await Promise.all(
        photos.map((p: any) =>
          tx.photo.create({
            data: {
              albumId,
              fileName: p.fileName,
              previewUrl: p.keys.preview,
              thumbnailUrl: p.keys.thumbnail,
              originalUrl: p.keys.original,
              fileSize: p.fileSize,
              width: p.width || 0,
              height: p.height || 0,
            }
          })
        )
      );
    });

    // 2. If it's a magic album, trigger face indexing OUTSIDE the transaction
    if (album.isMagic) {
      console.log(`Indexing faces for ${results.length} photos in album ${albumId}`);
      
      // Set indexing status to true
      await prisma.album.update({
        where: { id: albumId },
        data: { isIndexing: true }
      });

      try {
        // Run indexing sequentially or in smaller chunks to avoid overwhelming Rekognition
        for (const p of results) {
          if (p.originalUrl) {
            await indexFaceForPhoto(p.id, albumId, p.originalUrl);
          }
        }
      } finally {
        // Always set indexing status to false when done
        await prisma.album.update({
          where: { id: albumId },
          data: { isIndexing: false }
        });
      }
    }
    return NextResponse.json({ success: true, count: results.length });
  } catch (error) {
    console.error("Desktop Photo Confirm Error:", error);
    return NextResponse.json({ error: "Failed to save photos" }, { status: 500 });
  }
}
