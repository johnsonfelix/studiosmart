import { NextResponse } from "next/server";
import { verifyDesktopAuth } from "@/lib/desktop-auth";
import { prisma } from "@/lib/prisma";
import { getPhotosByAlbum } from "@/services/photo.service";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifyDesktopAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    const { id: albumId } = await params;

    // Verify album belongs to studio
    const album = await prisma.album.findFirst({
      where: { id: albumId, studioId: authResult.studioId },
    });
    
    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    // Get photos for the album
    // We'll use a high limit to show most photos at once for the desktop app
    const photos = await getPhotosByAlbum(albumId, 1, 1000);

    return NextResponse.json(photos);
  } catch (error) {
    console.error("Desktop Photos Error:", error);
    return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 });
  }
}
