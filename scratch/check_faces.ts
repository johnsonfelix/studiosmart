import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const albumId = 'cmons9iuf0001js1ivyae16dy';
  
  const photos = await prisma.photo.findMany({
    where: { albumId }
  });

  let withFaces = 0;
  let withoutFaces = 0;

  for (const photo of photos) {
    if (photo.faceIds && photo.faceIds.length > 0) {
      withFaces++;
    } else {
      withoutFaces++;
    }
  }

  console.log(`Total Photos: ${photos.length}`);
  console.log(`Photos with faces: ${withFaces}`);
  console.log(`Photos without faces: ${withoutFaces}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
