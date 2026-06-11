import { NextResponse } from "next/server";
import { verifyDesktopAuth } from "@/lib/desktop-auth";
import { prisma } from "@/lib/prisma";
import { SearchFacesByImageCommand } from "@aws-sdk/client-rekognition";
import { rekognitionClient } from "@/lib/rekognition";
import { generatePresignedGetUrl } from "@/lib/s3";
import { sendMagicPhotosEmail } from "@/services/mail.service";

const SIMILARITY_THRESHOLD = 90;

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifyDesktopAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    const { id: registrationId } = await params;

    const guest = await prisma.magicRegistration.findUnique({
      where: { id: registrationId },
      include: { album: true },
    });

    if (!guest || guest.album.studioId !== authResult.studioId) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    const bucket = process.env.S3_BUCKET_NAME || "studiosmart";
    const command = new SearchFacesByImageCommand({
      CollectionId: guest.albumId,
      Image: { S3Object: { Bucket: bucket, Name: guest.selfieUrl } },
      FaceMatchThreshold: SIMILARITY_THRESHOLD,
      MaxFaces: 50,
    });

    try {
      const searchResult = await rekognitionClient.send(command);
      const matchedFaceIds =
        searchResult.FaceMatches?.map((match) => match.Face?.FaceId).filter(
          (id): id is string => !!id
        ) || [];

      if (matchedFaceIds.length > 0) {
        const matchedPhotos = await prisma.photo.findMany({
          where: {
            albumId: guest.albumId,
            faceIds: { hasSome: matchedFaceIds },
          },
          select: { id: true, previewUrl: true, thumbnailUrl: true },
        });

        const photosWithUrls = await Promise.all(
          matchedPhotos.map(async (photo) => ({
            id: photo.id,
            previewUrl: photo.previewUrl
              ? (await generatePresignedGetUrl(photo.previewUrl, 3600)) || ""
              : "",
            thumbnailUrl: photo.thumbnailUrl
              ? (await generatePresignedGetUrl(photo.thumbnailUrl, 3600)) || ""
              : "",
          }))
        );

        return NextResponse.json({
          success: true,
          photos: photosWithUrls.filter((p) => p.previewUrl !== ""),
        });
      }

      return NextResponse.json({ success: true, photos: [] });
    } catch (rekError: any) {
      console.error(`Rekognition error for ${guest.email}:`, rekError);
      return NextResponse.json({ success: true, photos: [] });
    }
  } catch (error) {
    console.error("Desktop Guest Match Error:", error);
    return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifyDesktopAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    const { id: registrationId } = await params;

    const guest = await prisma.magicRegistration.findUnique({
      where: { id: registrationId },
      include: { album: true },
    });

    if (!guest || guest.album.studioId !== authResult.studioId) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    const bucket = process.env.S3_BUCKET_NAME || "studiosmart";
    const command = new SearchFacesByImageCommand({
      CollectionId: guest.albumId,
      Image: { S3Object: { Bucket: bucket, Name: guest.selfieUrl } },
      FaceMatchThreshold: SIMILARITY_THRESHOLD,
      MaxFaces: 50,
    });

    try {
      const searchResult = await rekognitionClient.send(command);
      const matchedFaceIds =
        searchResult.FaceMatches?.map((match) => match.Face?.FaceId).filter(
          (id): id is string => !!id
        ) || [];

      if (matchedFaceIds.length > 0) {
        const matchedPhotos = await prisma.photo.findMany({
          where: {
            albumId: guest.albumId,
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
              return NextResponse.json({ success: true, message: "Email sent successfully!" });
            } else {
              await prisma.magicRegistration.update({
                where: { id: guest.id },
                data: { status: "FAILED" },
              });
              return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
            }
          }
        }
      }

      await prisma.magicRegistration.update({
        where: { id: guest.id },
        data: { status: "NO_MATCH" },
      });
      return NextResponse.json({ error: "No matches found for this guest" }, { status: 404 });
    } catch (rekError: any) {
      console.error(`Rekognition error for ${guest.email}:`, rekError);
      await prisma.magicRegistration.update({
        where: { id: guest.id },
        data: { status: "FAILED" },
      });
      return NextResponse.json({ error: "Face search failed" }, { status: 500 });
    }
  } catch (error) {
    console.error("Desktop Guest Dispatch Error:", error);
    return NextResponse.json({ error: "Failed to dispatch email" }, { status: 500 });
  }
}
