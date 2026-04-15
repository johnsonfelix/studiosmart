import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToS3 } from "@/lib/s3";
import { indexFaceForPhoto } from "@/services/rekognition.service";
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "STUDIO") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const albumId = formData.get("albumId") as string | null;

    if (!file || !albumId) {
      return NextResponse.json(
        { error: "Missing file or albumId" },
        { status: 400 }
      );
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit.` },
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

    // Upload to S3
    const key = `studios/${session.user.studioId}/albums/${albumId}/${Date.now()}-${file.name}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await uploadToS3(key, buffer, file.type);

    // Create photo record in database
    const photo = await prisma.photo.create({
      data: {
        albumId,
        fileName: file.name,
        previewUrl: key,
        thumbnailUrl: key,
        originalUrl: key,
        width: 0,
        height: 0,
        fileSize: file.size,
      },
    });

    // Run face indexing in the background (we don't strictly need to await it unless serverless timeout is strict, 
    // but awaiting ensures it completes for Vercel/Lambda)
    await indexFaceForPhoto(photo.id, albumId, key);

    return NextResponse.json({ photo, key });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
