"use server";

import { SearchFacesByImageCommand } from "@aws-sdk/client-rekognition";
import { rekognitionClient } from "@/lib/rekognition";
import { prisma } from "@/lib/prisma";
import { generatePresignedGetUrl } from "@/lib/s3";

const SIMILARITY_THRESHOLD = 85; 

export async function matchGuestSelfie(formData: FormData) {
  try {
    const selfieFile = formData.get("selfie") as File;
    const albumId = formData.get("albumId") as string;

    if (!selfieFile || !albumId) {
      return { error: "Missing selfie or album ID" };
    }

    const bytes = await selfieFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const command = new SearchFacesByImageCommand({
      CollectionId: albumId,
      Image: { Bytes: buffer },
      FaceMatchThreshold: SIMILARITY_THRESHOLD,
      MaxFaces: 50, 
    });

    let searchResult;
    try {
      searchResult = await rekognitionClient.send(command);
    } catch (rekError: any) {
      if (rekError.name === "InvalidParameterException") {
        return { error: "No clear face detected in the selfie." };
      }
      if (rekError.name === "ResourceNotFoundException") {
        return { error: "Event collection not found or indexing incomplete." };
      }
      throw rekError;
    }

    const matchedFaceIds = searchResult.FaceMatches?.map(
      (match) => match.Face?.FaceId
    ).filter((id): id is string => !!id) || [];

    if (matchedFaceIds.length === 0) {
      return { success: true, photos: [], message: "No matching photos found." };
    }

    const matchedPhotos = await prisma.photo.findMany({
      where: {
        albumId: albumId,
        faceIds: {
          hasSome: matchedFaceIds,
        },
      },
      select: {
        id: true,
        previewUrl: true,
        originalUrl: true,
        thumbnailUrl: true,
      }
    });

    const photosWithUrls = await Promise.all(
      matchedPhotos.map(async (photo) => ({
        id: photo.id,
        fullResUrl: photo.originalUrl ? await generatePresignedGetUrl(photo.originalUrl) : null,
        previewUrl: photo.previewUrl ? await generatePresignedGetUrl(photo.previewUrl) : null,
      }))
    );

    return { success: true, photos: photosWithUrls };
  } catch (error) {
    console.error("Match Selfie Error:", error);
    return { error: "An unexpected error occurred while searching for matches." };
  }
}
