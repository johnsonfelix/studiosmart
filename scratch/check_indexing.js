const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const albumId = 'cmok31fv90007jv1irtrm1fin';
  
  const album = await prisma.album.findUnique({
    where: { id: albumId },
    select: { isIndexing: true, title: true }
  });
  
  console.log(`Album: ${album.title} | isIndexing: ${album.isIndexing}`);
  
  const totalPhotos = await prisma.photo.count({
    where: { albumId }
  });
  
  // Count photos where faceIds array is not empty
  // For PostgreSQL, checking if array is empty can be done by looking if it has elements
  // We can just fetch all and check, or use raw query. Let's just fetch id and faceIds for simplicity.
  const photos = await prisma.photo.findMany({
    where: { albumId },
    select: { id: true, faceIds: true }
  });
  
  const indexedCount = photos.filter(p => p.faceIds && p.faceIds.length > 0).length;
  
  console.log(`Total Photos: ${totalPhotos}`);
  console.log(`Photos with indexed faces: ${indexedCount}`);
  console.log(`Photos without faces (or not indexed yet): ${totalPhotos - indexedCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
