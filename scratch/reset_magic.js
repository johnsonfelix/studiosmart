const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const albumId = 'cmok31fv90007jv1irtrm1fin';
  
  const result = await prisma.magicRegistration.updateMany({
    where: { albumId },
    data: { status: 'PENDING' }
  });
  
  console.log(`Successfully reset ${result.count} registrations to PENDING for album ${albumId}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
