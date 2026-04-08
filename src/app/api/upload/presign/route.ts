import { generatePresignedUploadUrl } from "@/lib/s3";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "STUDIO") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileName, contentType, albumId, fileSize } = await req.json();

    if (!fileName || !contentType || !albumId || !fileSize) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds the limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB.` },
        { status: 400 }
      );
    }

    const album = await prisma.album.findUnique({
      where: { id: albumId, studioId: session.user.studioId },
    });

    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    const key = `studios/${session.user.studioId}/albums/${albumId}/${Date.now()}-${fileName}`;
    const uploadUrl = await generatePresignedUploadUrl(key, contentType);

    return NextResponse.json({ uploadUrl, key });
  } catch (error) {
    console.error("Presign error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
