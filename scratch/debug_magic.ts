import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { prisma } from "../src/lib/prisma";

async function run() {
  const albumId = "cmny9d5a80001gacgikzlhxfy";

  console.log("Fetching album...");
  const album = await prisma.album.findUnique({
    where: { id: albumId },
    include: { client: true }
  });
  console.log("Album:", album?.title);
  console.log("Client:", album?.client?.name);

  const photos = await prisma.photo.findMany({
    where: { albumId }
  });

  console.log(`Found ${photos.length} photos in album.`);
  let indexedFacesCount = 0;
  photos.forEach(p => {
    if (p.faceIds && p.faceIds.length > 0) {
      indexedFacesCount++;
    }
  });
  console.log(`Photos with indexed faces: ${indexedFacesCount}`);

  const guests = await prisma.magicRegistration.findMany({
    where: { albumId }
  });

  console.log(`Found ${guests.length} guest registrations.`);
  guests.forEach(g => {
    console.log(`- ${g.email} [${g.status}] selfie: ${g.selfieUrl}`);
  });
}

run()
  .then(() => process.exit(0))
  .catch(console.error);
