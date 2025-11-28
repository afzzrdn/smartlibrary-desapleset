const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Mulai proses seeding...');
  
  const adminEmail = 'admin@elibrary.com';
  const adminPass = 'admin123';
  const hashedPass = await bcrypt.hash(adminPass, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {}, 
    create: {
      email: adminEmail,
      password: hashedPass,
      role: 'admin',
    },
  });

  console.log(`Admin user ${admin.email} telah dibuat/tersedia.`);
  
  await prisma.category.upsert({
    where: { name: 'Non-Fiksi' },
    update: {},
    create: { name: 'Non-Fiksi' },
  });
  
  await prisma.category.upsert({
    where: { name: 'Fiksi' },
    update: {},
    create: { name: 'Fiksi' },
  });
  
  console.log('Kategori awal telah dibuat.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });