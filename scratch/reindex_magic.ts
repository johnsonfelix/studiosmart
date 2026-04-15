import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { prisma } from "../src/lib/prisma";
import { indexFaceForPhoto } from "../src/services/rekognition.service";

async function run() {
  const albumId = "cmny9d5a80001gacgikzlhxfy";

  const photos = await prisma.photo.findMany({
    where: { albumId }
  });

  const unindexedPhotos = photos.filter(p => !p.faceIds || p.faceIds.length === 0);
  
  if (unindexedPhotos.length === 0) {
    console.log("All photos are already indexed!");
    return;
  }

  console.log(`Re-indexing ${unindexedPhotos.length} photos...`);

  let successCount = 0;
  for (const photo of unindexedPhotos) {
    console.log(`Indexing photo ${photo.id}...`);
    const result = await indexFaceForPhoto(photo.id, albumId, photo.originalUrl || photo.previewUrl);
    if (result.success) successCount++;
  }

  console.log(`Successfully indexed ${successCount}/${unindexedPhotos.length} photos.`);

  await prisma.magicRegistration.updateMany({
    where: { albumId, status: "FAILED" },
    data: { status: "PENDING" }
  });
  console.log("Reset failed guest registrations to PENDING.");
}

run()
  .then(() => process.exit(0))
  .catch(console.error);
