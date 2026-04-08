const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const userCount = await prisma.user.count();
  
  if (userCount === 0) {
    const adminHash = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@studio.smart',
        password: adminHash,
        role: 'ADMIN',
      },
    });

    const studioHash = await bcrypt.hash('studio123', 10);
    const studioUser = await prisma.user.create({
      data: {
        name: 'Smart Photography',
        email: 'test@studio.smart',
        password: studioHash,
        role: 'STUDIO',
      },
    });

    await prisma.studio.create({
      data: {
        name: 'Smart Photography Studio',
        ownerId: studioUser.id,
      },
    });

    console.log('Seeded successfully.');
  } else {
    console.log('Database already has users.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
