import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { indexFaceForPhoto } from "@/services/rekognition.service";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "STUDIO") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { key, albumId, filename, fileSize } = await req.json();

    if (!key || !albumId || !filename) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify album ownership
    const album = await prisma.album.findUnique({
      where: { id: albumId, studioId: session.user.studioId },
    });

    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    // Create photo record and set indexing status
    const [photo] = await prisma.$transaction([
      prisma.photo.create({
        data: {
          albumId,
          fileName: filename,
          previewUrl: key,
          thumbnailUrl: key,
          originalUrl: key,
          width: 0,
          height: 0,
          fileSize: fileSize || 0,
        },
      }),
      prisma.album.update({
        where: { id: albumId },
        data: { isIndexing: true },
      }),
    ]);

    // Background trigger Rekognition indexing directly on the S3 Object
    await indexFaceForPhoto(photo.id, albumId, key);

    return NextResponse.json({ success: true, photo });
  } catch (error) {
    console.error("Uppy confirmation error:", error);
    return NextResponse.json(
      { error: "Failed to confirm upload" },
      { status: 500 }
    );
  }
}
