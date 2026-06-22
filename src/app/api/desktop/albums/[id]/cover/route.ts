import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyDesktopAuth } from "@/lib/desktop-auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifyDesktopAuth(req);
    
    if (authResult instanceof NextResponse) {
      return authResult; // Unauthorized
    }

    const session = authResult;
    const { id: albumId } = await params;

    const body = await req.json();
    const { photoUrl } = body;

    if (!photoUrl) {
      return NextResponse.json({ error: "photoUrl is required" }, { status: 400 });
    }

    // Verify the album belongs to the studio
    const existingAlbum = await prisma.album.findUnique({
      where: {
        id: albumId,
        studioId: session.studioId
      }
    });

    if (!existingAlbum) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    // Update the album with the new cover URL
    const updatedAlbum = await prisma.album.update({
      where: {
        id: albumId
      },
      data: {
        coverUrl: photoUrl
      }
    });

    return NextResponse.json({ success: true, coverUrl: updatedAlbum.coverUrl });
  } catch (error) {
    console.error("Desktop Album Cover Update Error:", error);
    return NextResponse.json({ error: "Failed to update album cover" }, { status: 500 });
  }
}
