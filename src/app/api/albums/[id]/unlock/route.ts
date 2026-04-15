import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user.studioId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: albumId } = await params;

    // Verify the album belongs to the studio
    const album = await prisma.album.findUnique({
      where: { id: albumId, studioId: session.user.studioId }
    });

    if (!album) {
      return NextResponse.json({ error: "Album not found or access denied" }, { status: 404 });
    }

    // Update the album status
    await prisma.album.update({
      where: { id: albumId },
      data: {
        selectionLocked: false
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Unlock Selection API Error:", error);
    return NextResponse.json(
      { error: "Failed to unlock selection" },
      { status: 500 }
    );
  }
}
