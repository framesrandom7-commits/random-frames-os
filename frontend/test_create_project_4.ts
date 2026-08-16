import { ProjectService } from './domain/services/ProjectService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const client = await prisma.client.findFirst();
    const result = await ProjectService.create({
      title: "Wedding Shoot",
      clientId: client.id,
      category: "ONE_TIME_SHOOT",
      status: "PLANNING",
      priority: "MEDIUM",
      paymentStatus: "PENDING",
      quotationAmount: 5000,
      additionalServicesAmount: 500,
      additionalChargesAmount: 300,
      discountAmount: 0,
      taxAmount: 0,
      advanceAmount: 2000,
      totalAmount: 5800,
      balanceAmount: 3800,
      assignedUserIds: [],
      quotationId: null
    });
    console.log("Success!", result.id);
  } catch (e) {
    console.error("Error:", e);
  }
}
main();
