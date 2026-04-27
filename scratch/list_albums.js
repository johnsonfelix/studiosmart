const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function list() {
  const albums = await prisma.album.findMany({
    select: { id: true, title: true, isMagic: true, _count: { select: { photos: true } } }
  });
  console.log(JSON.stringify(albums, null, 2));
  await prisma.$disconnect();
}

list();
