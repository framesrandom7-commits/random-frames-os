/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ accelerateUrl: process.env.DATABASE_URL } as any);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
