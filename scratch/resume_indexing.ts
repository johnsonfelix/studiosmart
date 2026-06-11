import { PrismaClient } from '@prisma/client';
import { IndexFacesCommand, CreateCollectionCommand } from "@aws-sdk/client-rekognition";
import { rekognitionClient } from "../src/lib/rekognition";

const prisma = new PrismaClient();
const DEFAULT_BUCKET = process.env.S3_BUCKET_NAME || "studiosmart";

async function indexFaceForPhoto(photoId: string, albumId: string, s3Key: string) {
  try {
    const command = new IndexFacesCommand({
      CollectionId: albumId,
      Image: {
        S3Object: {
          Bucket: DEFAULT_BUCKET,
          Name: s3Key,
        },
      },
      DetectionAttributes: ["DEFAULT"],
      MaxFaces: 10,
      QualityFilter: "AUTO",
    });

    let response;
    try {
      response = await rekognitionClient.send(command);
    } catch (err: any) {
      if (err.name === "ResourceNotFoundException") {
        await rekognitionClient.send(new CreateCollectionCommand({ CollectionId: albumId }));
        response = await rekognitionClient.send(command);
      } else {
        throw err;
      }
    }
    
    const faceIds = response.FaceRecords?.map((record) => record.Face?.FaceId)
      .filter((id): id is string => !!id) || [];

    if (faceIds.length > 0) {
      await prisma.photo.update({
        where: { id: photoId },
        data: { faceIds: faceIds },
      });
      console.log(`Saved ${faceIds.length} faceIds for photo ${photoId}`);
    } else {
      console.log(`No faces detected in photo ${photoId}`);
    }
    
    return { success: true, faceCount: faceIds.length };
  } catch (error: any) {
    console.error("Face indexing error details:", error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  const albumId = 'cmons9iuf0001js1ivyae16dy';
  
  // Set to indexing
  await prisma.album.update({
    where: { id: albumId },
    data: { isIndexing: true }
  });
  console.log('Started indexing, UI will show in progress.');

  const photos = await prisma.photo.findMany({
    where: { albumId }
  });

  const photosToProcess = photos.filter(p => !p.faceIds || p.faceIds.length === 0);
  console.log(`Found ${photosToProcess.length} photos without faces. Processing...`);

  let processed = 0;
  for (const photo of photosToProcess) {
    if (photo.originalUrl) {
      await indexFaceForPhoto(photo.id, albumId, photo.originalUrl);
      processed++;
      if (processed % 10 === 0) {
        console.log(`Processed ${processed}/${photosToProcess.length}`);
      }
    }
  }

  // Set to false
  await prisma.album.update({
    where: { id: albumId },
    data: { isIndexing: false }
  });
  console.log('Finished processing, UI unblocked.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
