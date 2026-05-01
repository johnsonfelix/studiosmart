import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { IndexFacesCommand, CreateCollectionCommand } from "@aws-sdk/client-rekognition";
import { RekognitionClient } from "@aws-sdk/client-rekognition";

const prisma = new PrismaClient();
const rekognitionClient = new RekognitionClient({
  region: process.env.S3_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});
const DEFAULT_BUCKET = process.env.S3_BUCKET_NAME || "studiosmart";

async function indexFaceForPhoto(photoId: string, albumId: string, s3Key: string) {
  try {
    const command = new IndexFacesCommand({
      CollectionId: albumId,
      Image: { S3Object: { Bucket: DEFAULT_BUCKET, Name: s3Key } },
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
    
    const faceIds = response.FaceRecords?.map((record) => record.Face?.FaceId).filter((id): id is string => !!id) || [];
    
    if (faceIds.length > 0) {
      await prisma.photo.update({
        where: { id: photoId },
        data: { faceIds: faceIds },
      });
    }
    return true;
  } catch (error: any) {
    console.error("Error on photo", photoId, error.message);
    return false;
  }
}

async function main() {
  const albumId = 'cmok31fv90007jv1irtrm1fin';
  console.log(`Resuming indexing for ${albumId}`);

  const photos = await prisma.photo.findMany({
    where: { albumId },
    select: { id: true, originalUrl: true, faceIds: true }
  });

  // We skip photos that already have faces. 
  // This will also re-index photos that legitimately had 0 faces, but that's fine.
  const toIndex = photos.filter(p => !p.faceIds || p.faceIds.length === 0);
  console.log(`Found ${toIndex.length} photos to index...`);

  let count = 0;
  const CONCURRENCY = 10;

  for (let i = 0; i < toIndex.length; i += CONCURRENCY) {
    const chunk = toIndex.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map(async (p) => {
      if (p.originalUrl) {
        await indexFaceForPhoto(p.id, albumId, p.originalUrl);
      }
    }));
    count += chunk.length;
    console.log(`Processed ${count}/${toIndex.length}`);
  }

  // Once done, set isIndexing to false
  await prisma.album.update({
    where: { id: albumId },
    data: { isIndexing: false }
  });

  console.log(`Finished processing. isIndexing set to false.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
