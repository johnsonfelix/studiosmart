import { NextResponse } from "next/server";
import { verifyDesktopAuth } from "@/lib/desktop-auth";
import { prisma } from "@/lib/prisma";
import { deleteS3Objects } from "@/lib/s3";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifyDesktopAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    const { id: albumId } = await params;

    // Verify ownership and get assets
    const album = await prisma.album.findUnique({
      where: { id: albumId, studioId: authResult.studioId },
      include: {
        photos: { select: { originalUrl: true, previewUrl: true, thumbnailUrl: true } },
      },
    });

    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    // Collect all S3 keys
    const s3Keys: string[] = [];
    album.photos.forEach((p) => {
      if (p.originalUrl) s3Keys.push(p.originalUrl);
      if (p.previewUrl) s3Keys.push(p.previewUrl);
      if (p.thumbnailUrl) s3Keys.push(p.thumbnailUrl);
    });

    // Delete from S3
    if (s3Keys.length > 0) {
      const batchSize = 1000;
      for (let i = 0; i < s3Keys.length; i += batchSize) {
        await deleteS3Objects(s3Keys.slice(i, i + batchSize));
      }
    }

    // Delete from Database
    await prisma.album.delete({ where: { id: albumId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Desktop Delete Album Error:", error);
    return NextResponse.json({ error: "Failed to delete album" }, { status: 500 });
  }
}
