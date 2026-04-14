import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const albums = await prisma.album.findMany({
    select: { id: true, title: true, createdAt: true, expiresAt: true }
  })
  console.log(JSON.stringify(albums, null, 2))
}

main().catch(console.error).finally(() => prisma.$disconnect())
