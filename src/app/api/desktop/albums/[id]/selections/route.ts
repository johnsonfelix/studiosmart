import { NextResponse } from "next/server";
import { verifyDesktopAuth } from "@/lib/desktop-auth";
import { prisma } from "@/lib/prisma";

import { generatePresignedGetUrl } from "@/lib/s3";

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

    // Get all selected photos (isSelected = true)
    const selections = await prisma.selection.findMany({
      where: {
        photo: { albumId },
        isSelected: true,
      },
      include: {
        photo: {
          select: { id: true, fileName: true, thumbnailUrl: true, previewUrl: true },
        },
      },
    });

    const selectedFileNames = selections.map((s) => s.photo.fileName);

    const selectedPhotos = await Promise.all(
      selections.map(async (s) => {
        const photo = s.photo;
        const key = photo.thumbnailUrl || photo.previewUrl;
        let url = null;
        if (key) {
          try {
            url = await generatePresignedGetUrl(key);
          } catch (_) {}
        }
        return {
          id: photo.id,
          fileName: photo.fileName,
          thumbnailUrl: url,
        };
      })
    );

    return NextResponse.json({
      albumId,
      selectionSubmittedAt: album.selectionSubmittedAt,
      selectionLocked: album.selectionLocked,
      selectedCount: selectedFileNames.length,
      selectedFileNames,
      selectedPhotos,
    });
  } catch (error) {
    console.error("Desktop Selections Error:", error);
    return NextResponse.json({ error: "Failed to fetch selections" }, { status: 500 });
  }
}
