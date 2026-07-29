import { SignJWT } from "jose";
import { PrismaClient } from "@prisma/client";
import { parseArgs } from "util";

const prisma = new PrismaClient();

async function generateToken(userId: string) {
  const secretKey = process.env.JWT_SECRET || "default_super_secret_key_change_in_production";
  const key = new TextEncoder().encode(secretKey);
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
  return token;
}

const routesToTest = [
  "/dashboard",
  "/leads",
  "/clients",
  "/projects",
  "/calendar",
  "/finance",
  "/finance/invoices",
  "/finance/quotations",
  "/finance/expenses",
  "/finance/payments",
  "/reports",
  "/settings",
  "/settings/integrations",
  "/profile",
  "/notifications",
  "/workflow",
  "/shoots",
  "/storage"
];

async function run() {
  const admin = await prisma.user.findFirst({ where: { email: 'admin@randomframes.in' } });
  if (!admin) {
    console.error("Admin user not found. Run seed first.");
    process.exit(1);
  }

  const token = await generateToken(admin.id);
  
  console.log(`Starting Route Audit for ${routesToTest.length} routes...`);
  const results: { route: string, status: number, statusText: string }[] = [];

  for (const route of routesToTest) {
    try {
      const url = `http://localhost:3000${route}`;
      const res = await fetch(url, {
        headers: {
          Cookie: `rf_session=${token}`
        }
      });
      console.log(`[${res.status}] ${route}`);
      results.push({ route, status: res.status, statusText: res.statusText });
    } catch (e: any) {
      console.error(`[ERROR] ${route} - ${e.message}`);
      results.push({ route, status: 0, statusText: e.message });
    }
  }

  const failures = results.filter(r => r.status >= 400 || r.status === 0);
  
  console.log("\n=========================");
  console.log("Audit Results");
  console.log(`Total: ${results.length}`);
  console.log(`Success: ${results.length - failures.length}`);
  console.log(`Failed: ${failures.length}`);
  if (failures.length > 0) {
    console.log("Failed Routes:");
    failures.forEach(f => console.log(`  - ${f.route}: ${f.status} ${f.statusText}`));
  }
  
  process.exit(failures.length > 0 ? 1 : 0);
}

run();
