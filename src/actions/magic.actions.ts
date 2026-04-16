"use server";

import "server-only";

import { SearchFacesByImageCommand, DeleteCollectionCommand } from "@aws-sdk/client-rekognition";
import { rekognitionClient } from "@/lib/rekognition";
import { prisma } from "@/lib/prisma";
import { generatePresignedGetUrl, uploadToS3, deleteS3Objects } from "@/lib/s3";
import { sendMagicPhotosEmail } from "@/services/mail.service";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const SIMILARITY_THRESHOLD = 85;

export async function registerMagicGuest(formData: FormData) {
  try {
    const selfieFile = formData.get("selfie") as File;
    const albumId = formData.get("albumId") as string;
    const email = formData.get("email") as string;

    if (!selfieFile || !albumId || !email) {
      return { error: "Missing selfie, email, or album ID" };
    }

    // Check if already registered
    const existing = await prisma.magicRegistration.findUnique({
      where: { albumId_email: { albumId, email } }
    });

    if (existing) {
      return { success: true, message: "You are already registered! Your photos will arrive once ready." };
    }

    const bytes = await selfieFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload selfie to S3 for later processing
    const s3Key = `magic-registrations/${albumId}/${email.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.jpg`;
    await uploadToS3(s3Key, buffer, selfieFile.type);

    await prisma.magicRegistration.create({
      data: {
        albumId,
        email,
        selfieUrl: s3Key,
      }
    });

    return {
      success: true,
      message: "You're registered! We will send your photos as soon as they are ready."
    };
  } catch (error) {
    console.error("Magic Guest Registration Error:", error);
    return { error: "An unexpected error occurred while saving your registration." };
  }
}

export async function dispatchMagicEmails(albumId: string) {
  try {
    const pendingGuests = await prisma.magicRegistration.findMany({
      where: { albumId, status: "PENDING" }
    });

    if (pendingGuests.length === 0) {
      return { success: true, count: 0, message: "No pending guests to process." };
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
        const searchResult = await rekognitionClient.send(command);
        const matchedFaceIds = searchResult.FaceMatches?.map(
          (match) => match.Face?.FaceId
        ).filter((id): id is string => !!id) || [];

        if (matchedFaceIds.length > 0) {
          const matchedPhotos = await prisma.photo.findMany({
            where: {
              albumId: albumId,
              faceIds: { hasSome: matchedFaceIds },
            },
            select: { id: true, previewUrl: true, originalUrl: true }
          });

          if (matchedPhotos.length > 0) {
            const photosWithUrls = await Promise.all(
              matchedPhotos.map(async (photo) => ({
                id: photo.id,
                fullResUrl: photo.originalUrl ? await generatePresignedGetUrl(photo.originalUrl, 604800) || "" : "",
                previewUrl: photo.previewUrl ? await generatePresignedGetUrl(photo.previewUrl, 604800) || "" : "",
              }))
            );

            const validPhotos = photosWithUrls.filter(p => p.fullResUrl !== "" && p.previewUrl !== "").slice(0, 10);

            if (validPhotos.length > 0) {
              const emailResult = await sendMagicPhotosEmail(guest.email, validPhotos);
              if (emailResult?.success) {
                await prisma.magicRegistration.update({
                  where: { id: guest.id },
                  data: { status: "SENT" }
                });
                sentCount++;
                continue;
              }
            }
          }
        }

        // If it reaches here, no matches found or email failed to send
        await prisma.magicRegistration.update({
          where: { id: guest.id },
          data: { status: "NO_MATCH" }
        });

      } catch (rekError: any) {
        console.error(`Rekognition error for ${guest.email}:`, rekError.name);
        await prisma.magicRegistration.update({
          where: { id: guest.id },
          data: { status: "FAILED" }
        });
      }
    }

    return {
      success: true,
      count: sentCount,
      message: `Dispatched ${sentCount} magic emails successfully!`
    };
  } catch (error) {
    console.error("Magic Dispatch Error:", error);
    return { error: "An unexpected error occurred while dispatching emails." };
  }
}

export async function getPresignedUrls(keys: string[]) {
  try {
    const urls = await Promise.all(
      keys.map(async (key) => ({
        key,
        url: await generatePresignedGetUrl(key),
      }))
    );
    return { success: true, urls };
  } catch (error) {
    console.error("Error getting presigned urls:", error);
    return { error: "Failed to generate visual access links." };
  }
}

export async function deleteMagicEvent(albumId: string) {
  try {
    const session = await auth();
    if (!session || !session.user.studioId) {
      return { error: "Unauthorized" };
    }

    // 1. Verify ownership and get assets
    const album = await prisma.album.findUnique({
      where: { id: albumId, studioId: session.user.studioId },
      include: {
        photos: { select: { originalUrl: true, previewUrl: true, thumbnailUrl: true } },
        magicRegistrations: { select: { selfieUrl: true } }
      }
    });

    if (!album) {
      return { error: "Event not found" };
    }

    // 2. Collect all S3 keys
    const s3Keys: string[] = [];
    album.photos.forEach(p => {
      if (p.originalUrl) s3Keys.push(p.originalUrl);
      if (p.previewUrl) s3Keys.push(p.previewUrl);
      if (p.thumbnailUrl) s3Keys.push(p.thumbnailUrl);
    });
    album.magicRegistrations.forEach(r => {
      if (r.selfieUrl) s3Keys.push(r.selfieUrl);
    });

    // 3. Delete from S3 in batches
    if (s3Keys.length > 0) {
      // S3 DeleteObjects max 1000 keys per request
      const batchSize = 1000;
      for (let i = 0; i < s3Keys.length; i += batchSize) {
        const batch = s3Keys.slice(i, i + batchSize);
        await deleteS3Objects(batch);
      }
    }

    // 4. Delete Rekognition Collection
    try {
      const deleteCol = new DeleteCollectionCommand({ CollectionId: albumId });
      await rekognitionClient.send(deleteCol);
    } catch (rekError: any) {
      // If collection doesn't exist, just log it and continue
      console.warn("Rekognition collection deletion failed (might not exist):", rekError.name);
    }

    // 5. Delete from Database (Cascading deletes related photos, registrations, etc.)
    await prisma.album.delete({
      where: { id: albumId }
    });

    revalidatePath("/studio/magic");
    return { success: true };
  } catch (error) {
    console.error("Delete Magic Event Error:", error);
    return { error: "Failed to delete the event and its associated data." };
  }
}


