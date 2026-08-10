import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data...');

  const passwordHash = await bcrypt.hash('Ponnappa@14', 10);

  // 1. Create Founder
  const founder = await prisma.user.upsert({
    where: { email: 'frames.random.7@gmail.com' },
    update: {},
    create: {
      name: 'Founder Admin',
      email: 'frames.random.7@gmail.com',
      password: passwordHash,
      role: 'FOUNDER',
    },
  });
  console.log(`Created Founder: ${founder.email}`);

  // 2. Create Co-Founder
  const cofounderPasswordHash = await bcrypt.hash('Pooja@04', 10);
  const coFounder = await prisma.user.upsert({
    where: { email: 'hbpooja04@gmail.com' },
    update: {},
    create: {
      name: 'Co-Founder Operations',
      email: 'hbpooja04@gmail.com',
      password: cofounderPasswordHash,
      role: 'CO_FOUNDER',
    },
  });
  console.log(`Created Co-Founder: ${coFounder.email}`);

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
