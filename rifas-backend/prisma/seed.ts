import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create default admin user
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {
      password: hashedPassword, // Update password if user exists
    },
    create: {
      username: 'admin',
      email: 'admin@rifa.com',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('✅ Admin user created:', {
    username: adminUser.username,
    email: adminUser.email,
    role: adminUser.role,
  });

  // Create some test references if they don't exist
  const testReferences = [
    { reference: '123456', ticketCount: 5 },
  ];

  for (const ref of testReferences) {
    await prisma.reference.upsert({
      where: { reference: ref.reference },
      update: {},
      create: {
        reference: ref.reference,
        ticketCount: ref.ticketCount,
        used: false,
      },
    });
  }

  console.log('✅ Test references created');

  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });




