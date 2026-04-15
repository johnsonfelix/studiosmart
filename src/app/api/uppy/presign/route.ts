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

    const body = await req.json();
    const { filename, contentType, metadata } = body;
    const albumId = metadata?.albumId;

    if (!filename || !contentType || !albumId) {
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

    const album = await prisma.album.findUnique({
      where: { id: albumId, studioId: session.user.studioId },
    });

    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    // Generate S3 key
    const key = `studios/${session.user.studioId}/magic/${albumId}/${Date.now()}-${filename}`;
    const uploadUrl = await generatePresignedUploadUrl(key, contentType);

    // Uppy @uppy/aws-s3 expects this exact response structure for dynamic URL generation
    return NextResponse.json({
      method: "PUT",
      url: uploadUrl,
      fields: {},
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    console.error("Uppy Presign error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
