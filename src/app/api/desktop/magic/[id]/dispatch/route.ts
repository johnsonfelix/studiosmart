import { NextResponse } from "next/server";
import { verifyDesktopAuth } from "@/lib/desktop-auth";
import { prisma } from "@/lib/prisma";
import { SearchFacesByImageCommand } from "@aws-sdk/client-rekognition";
import { rekognitionClient } from "@/lib/rekognition";
import { generatePresignedGetUrl } from "@/lib/s3";
import { sendMagicPhotosEmail } from "@/services/mail.service";

const SIMILARITY_THRESHOLD = 90;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifyDesktopAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    const { id: albumId } = await params;

    // Verify ownership
    const album = await prisma.album.findFirst({
      where: { id: albumId, studioId: authResult.studioId },
    });

    if (!album) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Process PENDING, NO_MATCH and FAILED guests for retry
    const pendingGuests = await prisma.magicRegistration.findMany({
      where: { 
        albumId, 
        status: { in: ["PENDING", "NO_MATCH", "FAILED"] } 
      },
    });

    if (pendingGuests.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: "No pending guests to process." });
    }

    let sentCount = 0;
    const bucket = process.env.S3_BUCKET_NAME || "studiosmart";

    for (const guest of pendingGuests) {
      const command = new SearchFacesByImageCommand({
        CollectionId: albumId,
        Image: { S3Object: { Bucket: bucket, Name: guest.selfieUrl } },
        FaceMatchThreshold: SIMILARITY_THRESHOLD,
        MaxFaces: 50,
      });

      try {
        console.log(`Searching faces for guest ${guest.email} using selfie ${guest.selfieUrl}...`);
        const searchResult = await rekognitionClient.send(command);
        console.log(`Rekognition result for ${guest.email}: ${searchResult.FaceMatches?.length || 0} matches found.`);
        const matchedFaceIds =
          searchResult.FaceMatches?.map((match) => match.Face?.FaceId).filter(
            (id): id is string => !!id
          ) || [];
        console.log(`Matched Face IDs for ${guest.email}:`, matchedFaceIds);

        if (matchedFaceIds.length > 0) {
          const matchedPhotos = await prisma.photo.findMany({
            where: {
              albumId,
              faceIds: { hasSome: matchedFaceIds },
            },
            select: { id: true, previewUrl: true, originalUrl: true },
          });

          if (matchedPhotos.length > 0) {
            const photosWithUrls = await Promise.all(
              matchedPhotos.map(async (photo) => ({
                id: photo.id,
                fullResUrl: photo.originalUrl
                  ? (await generatePresignedGetUrl(photo.originalUrl, 604800)) || ""
                  : "",
                previewUrl: photo.previewUrl
                  ? (await generatePresignedGetUrl(photo.previewUrl, 604800)) || ""
                  : "",
              }))
            );

            const validPhotos = photosWithUrls
              .filter((p) => p.fullResUrl !== "" && p.previewUrl !== "")
              .slice(0, 10);

            if (validPhotos.length > 0) {
              const emailResult = await sendMagicPhotosEmail(guest.email, validPhotos);
              if (emailResult?.success) {
                await prisma.magicRegistration.update({
                  where: { id: guest.id },
                  data: { status: "SENT" },
                });
                sentCount++;
                continue;
              } else {
                console.error(`Email failed for ${guest.email}:`, emailResult?.error);
                await prisma.magicRegistration.update({
                  where: { id: guest.id },
                  data: { status: "FAILED" },
                });
                continue;
              }
            }
          }
        }

        await prisma.magicRegistration.update({
          where: { id: guest.id },
          data: { status: "NO_MATCH" },
        });
      } catch (rekError: any) {
        console.error(`Rekognition error for ${guest.email}:`, rekError);
        await prisma.magicRegistration.update({
          where: { id: guest.id },
          data: { status: "FAILED" },
        });
      }
    }

    return NextResponse.json({
      success: true,
      count: sentCount,
      message: `Dispatched ${sentCount} magic emails successfully!`,
    });
  } catch (error) {
    console.error("Desktop Dispatch Error:", error);
    return NextResponse.json({ error: "Failed to dispatch magic emails" }, { status: 500 });
  }
}
