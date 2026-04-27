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
    const createdPhotosCount = await prisma.$transaction(async (tx) => {
      const results = await Promise.all(
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

      // If it's a magic album, trigger face indexing
      if (album.isMagic) {
        // We don't await this to keep the response fast, or we can await it if we want reliability
        // For desktop app, it's better to index now
        await Promise.all(
          results.map((p) => indexFaceForPhoto(p.id, albumId, p.originalUrl))
        );
      }

      return results.length;
    });

    return NextResponse.json({ success: true, count: createdPhotosCount });
  } catch (error) {
    console.error("Desktop Photo Confirm Error:", error);
    return NextResponse.json({ error: "Failed to save photos" }, { status: 500 });
  }
}
