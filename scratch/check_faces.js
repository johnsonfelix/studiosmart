const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFaces() {
  const photos = await prisma.photo.findMany({
    where: { faceIds: { isEmpty: false } },
    take: 5,
    select: { id: true, fileName: true, faceIds: true, albumId: true }
  });

  console.log('Photos with Face IDs:', JSON.stringify(photos, null, 2));
  
  const totalWithFaces = await prisma.photo.count({ where: { faceIds: { isEmpty: false } } });
  console.log('Total photos with faces:', totalWithFaces);
  
  const totalPhotos = await prisma.photo.count();
  console.log('Total photos in DB:', totalPhotos);

  const registrations = await prisma.magicRegistration.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' }
  });
  console.log('Recent registrations:', JSON.stringify(registrations, null, 2));

  await prisma.$disconnect();
}

checkFaces();
