import { NextResponse } from "next/server";
import { verifyDesktopAuth } from "@/lib/desktop-auth";
import { prisma } from "@/lib/prisma";

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

    // Save photos to database
    const createdPhotos = await prisma.photo.createMany({
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
    });

    return NextResponse.json({ success: true, count: createdPhotos.count });
  } catch (error) {
    console.error("Desktop Photo Confirm Error:", error);
    return NextResponse.json({ error: "Failed to save photos" }, { status: 500 });
  }
}
