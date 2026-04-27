import { NextResponse } from "next/server";
import { verifyDesktopAuth } from "@/lib/desktop-auth";
import { generatePresignedUploadUrl } from "@/lib/s3";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const authResult = await verifyDesktopAuth(req);
    
    if (authResult instanceof NextResponse) {
      return authResult; // Unauthorized
    }

    const { albumId, files } = await req.json();

    if (!albumId || !files || !Array.isArray(files)) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    // Verify album belongs to studio
    const album = await prisma.album.findFirst({
      where: { id: albumId, studioId: authResult.studioId }
    });

    if (!album) {
      return NextResponse.json({ error: "Album not found or unauthorized" }, { status: 404 });
    }

    const presignedUrls = await Promise.all(
      files.map(async (file: { name: string; type: string }) => {
        const fileId = uuidv4();
        // Only one key for everything to save storage cost
        const originalKey = `albums/${albumId}/originals/${fileId}-${file.name}`;

        const originalUrl = await generatePresignedUploadUrl(originalKey, file.type);

        return {
          originalName: file.name,
          fileId,
          keys: {
            preview: originalKey,
            thumbnail: originalKey,
            original: originalKey,
          },
          uploadUrls: {
            preview: originalUrl,
            thumbnail: originalUrl,
            original: originalUrl,
          }
        };
      })
    );

    return NextResponse.json({ presignedUrls });
  } catch (error) {
    console.error("Desktop S3 Presigned URL Error:", error);
    return NextResponse.json({ error: "Failed to generate upload URLs" }, { status: 500 });
  }
}
