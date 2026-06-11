import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const albumId = 'cmons9iuf0001js1ivyae16dy';
  const album = await prisma.album.findUnique({
    where: { id: albumId },
    include: {
      _count: {
        select: { photos: true }
      }
    }
  });

  console.log('Album:', album?.title);
  console.log('isIndexing:', album?.isIndexing);
  console.log('Total photos in DB:', album?._count.photos);

  // set to false to unblock
  await prisma.album.update({
    where: { id: albumId },
    data: { isIndexing: false }
  });

  console.log('isIndexing set to false to unblock UI');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
