import { PrismaClient } from '@prisma/client';
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany({ take: 1 });
  const clients = await prisma.client.findMany({ take: 1 });
  const shoots = await prisma.shoot.findMany({ take: 1 });
  
  console.log('projects:', !!projects);
  console.log('clients:', !!clients);
  console.log('shoots:', !!shoots);
}

main().catch(console.error).finally(() => prisma.$disconnect());
