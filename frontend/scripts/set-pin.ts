import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

async function setPin(email: string, pin: string) {
  try {
    const pinHash = crypto.createHash('sha256').update(pin).digest('hex');
    await prisma.user.update({
      where: { email },
      data: { securityPin: pinHash }
    });
    console.log(`✅ Successfully set PIN to ${pin} for ${email}`);
  } catch (error) {
    console.error("❌ Failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Set PIN to 1234
setPin("frames.random.7@gmail.com", "1234");
