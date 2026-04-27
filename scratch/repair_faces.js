const { PrismaClient } = require('@prisma/client');
const { IndexFacesCommand, CreateCollectionCommand } = require("@aws-sdk/client-rekognition");
const { RekognitionClient } = require("@aws-sdk/client-rekognition");
require('dotenv').config();

const prisma = new PrismaClient();
const rekognitionClient = new RekognitionClient({
  region: process.env.S3_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

async function repair() {
  console.log("Starting AI Face Indexing Repair...");
  
  const photos = await prisma.photo.findMany({
    where: { 
      faceIds: { isEmpty: true },
      originalUrl: { contains: "/magic/" }
    }
  });

  console.log(`Found ${photos.length} photos needing indexing.`);

  let successCount = 0;
  let failCount = 0;
  let totalFaces = 0;

  for (const photo of photos) {
    try {
      console.log(`Indexing photo ${photo.id}...`);
      
      const command = new IndexFacesCommand({
        CollectionId: photo.albumId,
        Image: {
          S3Object: {
            Bucket: process.env.S3_BUCKET_NAME || "studiosmart",
            Name: photo.originalUrl,
          },
        },
      });

      let response;
      try {
        response = await rekognitionClient.send(command);
      } catch (err) {
        if (err.name === "ResourceNotFoundException") {
          await rekognitionClient.send(new CreateCollectionCommand({ CollectionId: photo.albumId }));
          response = await rekognitionClient.send(command);
        } else { throw err; }
      }

      const faceIds = response.FaceRecords?.map(r => r.Face.FaceId).filter(Boolean) || [];
      
      await prisma.photo.update({
        where: { id: photo.id },
        data: { faceIds: faceIds }
      });
      
      successCount++;
      totalFaces += faceIds.length;
      console.log(`✅ Indexed ${faceIds.length} faces for ${photo.id}`);
    } catch (e) {
      failCount++;
      console.error(`❌ Failed to index ${photo.id}:`, e.message);
    }
  }

  console.log("\nRepair complete!");
  console.log(`Total Success: ${successCount}`);
  console.log(`Total Failed: ${failCount}`);
  console.log(`Total Faces Found: ${totalFaces}`);
  await prisma.$disconnect();
}

repair();
