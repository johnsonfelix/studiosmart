import { IndexFacesCommand, CreateCollectionCommand } from "@aws-sdk/client-rekognition";
import { rekognitionClient } from "@/lib/rekognition";
import { prisma } from "@/lib/prisma";

const DEFAULT_BUCKET = process.env.S3_BUCKET_NAME || "studiosmart";

export async function indexFaceForPhoto(photoId: string, albumId: string, s3Key: string) {
  try {
    const command = new IndexFacesCommand({
      CollectionId: albumId,
      Image: {
        S3Object: {
          Bucket: DEFAULT_BUCKET,
          Name: s3Key,
        },
      },
      DetectionAttributes: ["DEFAULT"], // No need for age/emotion, just features
      MaxFaces: 10, // Adjust based on expected crowd density
      QualityFilter: "AUTO",
    });

    let response;
    try {
      console.log(`Calling Rekognition IndexFaces for collection ${albumId}...`);
      response = await rekognitionClient.send(command);
    } catch (err: any) {
      if (err.name === "ResourceNotFoundException") {
        console.log(`Collection ${albumId} not found. Creating it now...`);
        await rekognitionClient.send(new CreateCollectionCommand({ CollectionId: albumId }));
        // Retry
        response = await rekognitionClient.send(command);
      } else {
        throw err;
      }
    }
    
    const faceIds = response.FaceRecords?.map((record) => record.Face?.FaceId)
      .filter((id): id is string => !!id) || [];

    console.log(`Found ${faceIds.length} faces for photo ${photoId}`);

    if (faceIds.length > 0) {
      // Update Prisma with extracted Face Ids
      await prisma.photo.update({
        where: { id: photoId },
        data: { faceIds: { push: faceIds } },
      });
      console.log(`Saved ${faceIds.length} faceIds for photo ${photoId}`);
    }
    
    return { success: true, faceCount: faceIds.length };
  } catch (error) {
    console.error("Face indexing error:", error);
    return { success: false, error: "Failed to index faces" };
  }
}
