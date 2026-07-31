import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const project = await prisma.project.findFirst({ select: { id: true, title: true } });
  const invoice = await prisma.invoice.findFirst({ select: { id: true, invoiceNumber: true } });
  const shoot = await prisma.shoot.findFirst({ select: { id: true, title: true } });

  console.log('Project:', project);
  console.log('Invoice:', invoice);
  console.log('Shoot:', shoot);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
