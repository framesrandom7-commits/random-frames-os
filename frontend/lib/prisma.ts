import { PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

// Set up WebSocket for Node.js environment
neonConfig.webSocketConstructor = ws;

const prismaClientSingleton = () => {
  // Use the connection string from environment variables
  const connectionString = process.env.DATABASE_URL || "";
  
  if (!connectionString) {
    console.warn("WARNING: DATABASE_URL is missing in prismaClientSingleton!");
  }

  // Initialize the Prisma Adapter with PoolConfig
  const adapter = new PrismaNeon({ connectionString });
  
  // Return PrismaClient with the adapter
  return new PrismaClient({ adapter });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
