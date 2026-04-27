const { RekognitionClient, IndexFacesCommand } = require("@aws-sdk/client-rekognition");
require('dotenv').config();

const rekognitionClient = new RekognitionClient({
  region: process.env.S3_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

async function testIndex() {
  const albumId = "cmoh68o9i0001jl1iif0cvmw2"; // From your recent registrations
  const key = "albums/cmoh1sn6m0001ju1isbi0y2af/originals/cmoh1sn6o0003ju1i6r9v9v9v-test.jpg"; // You'll need to find a real key
  
  // Let's find a real key from the DB first
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const photo = await prisma.photo.findFirst({
    where: { albumId: albumId, originalUrl: { not: null } }
  });
  
  if (!photo) {
    console.log("No photos found in DB for this album to test with.");
    return;
  }
  
  console.log(`Testing indexing for photo ${photo.id} with key ${photo.originalUrl} in bucket ${process.env.S3_BUCKET_NAME}`);

  try {
    const command = new IndexFacesCommand({
      CollectionId: albumId,
      Image: {
        S3Object: {
          Bucket: process.env.S3_BUCKET_NAME || "studiosmart",
          Name: photo.originalUrl,
        },
      },
      MaxFaces: 1,
    });

    const response = await rekognitionClient.send(command);
    console.log("SUCCESS!", JSON.stringify(response, null, 2));
  } catch (err) {
    console.error("FAILED!", err);
  } finally {
    await prisma.$disconnect();
  }
}

testIndex();
