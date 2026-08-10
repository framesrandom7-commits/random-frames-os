import { ProjectService } from "./domain/services/ProjectService";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function run() {
  try {
    const client = await prisma.client.findFirst();
    if (!client) throw new Error("No client found");

    console.log("Attempting to create project without quotation via backend...");
    const project = await ProjectService.create({
      title: "Hacked Project",
      clientId: client.id,
      category: "ONE_TIME_SHOOT",
      status: "PLANNING",
      priority: "MEDIUM",
      paymentStatus: "PENDING",
      quotationAmount: 50000, // Manually injecting amount without quotation
      additionalServicesAmount: 0,
      additionalChargesAmount: 0,
      discountAmount: 0,
      taxAmount: 0,
      advanceAmount: 0,
      totalAmount: 50000,
      balanceAmount: 50000,
    });
    
    console.log("SUCCESS! Created project ID:", project.id, "without a quotationId.");
  } catch (err) {
    console.error("FAILED to create project (this is expected if backend blocks it):", err);
  } finally {
    await prisma.$disconnect();
  }
}
run();
