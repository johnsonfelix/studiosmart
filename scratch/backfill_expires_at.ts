import { PrismaClient } from '@prisma/client'
import { addDays } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
  console.log('--- Starting Album Expiration Backfill ---')
  
  // 1. Find all albums without an expiration date
  const albums = await prisma.album.findMany({
    where: { expiresAt: null },
    select: { id: true, title: true, createdAt: true }
  })

  console.log(`Found ${albums.length} albums to update.`)

  let updatedCount = 0;
  for (const album of albums) {
    const expiresAt = addDays(new Date(album.createdAt), 180);
    
    await prisma.album.update({
      where: { id: album.id },
      data: { expiresAt }
    })
    
    console.log(`Updated [${album.title}]: Expires on ${expiresAt.toISOString()}`)
    updatedCount++;
  }

  console.log(`--- Finished. Updated ${updatedCount} albums. ---`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
