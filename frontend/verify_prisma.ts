import { PrismaClient } from '@prisma/client';
import "dotenv/config";

const prisma = new PrismaClient();
console.log('shoot:', !!prisma.shoot);
process.exit(0);
