import { FinanceService } from "./domain/services/FinanceService";
import { ProjectService } from "./domain/services/ProjectService";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function run() {
  try {
    console.log("=== STARTING FLOW 3 TEST (Quotation Edit Sync) ===");
    
    const client = await prisma.client.findFirst();
    if (!client) throw new Error("Client not found");

    console.log("1. Creating Quotation for 1000...");
    const quotation = await FinanceService.createQuotation({
      quotationNumber: `Q-${Date.now()}`,
      issueDate: new Date(),
      validUntil: new Date(),
      subtotal: 1000,
      total: 1000,
      clientId: client.id,
      status: "APPROVED",
      items: [{ description: "Base", quantity: 1, unitPrice: 1000, total: 1000 }]
    });

    console.log("2. Creating Project...");
    const project = await ProjectService.create({
      title: "Sync Test Project",
      clientId: client.id,
      category: "ONE_TIME_SHOOT",
      status: "PLANNING",
      priority: "MEDIUM",
      paymentStatus: "PENDING",
      quotationId: quotation.id,
      quotationAmount: 1000,
      additionalServicesAmount: 0,
      additionalChargesAmount: 0,
      discountAmount: 0,
      taxAmount: 0,
      advanceAmount: 0,
      totalAmount: 1000,
      balanceAmount: 1000
    } as any);

    console.log("3. Editing Quotation to 5000...");
    await FinanceService.updateQuotation(quotation.id, {
      ...quotation,
      subtotal: 5000,
      total: 5000,
      items: [{ description: "Base", quantity: 1, unitPrice: 5000, total: 5000 }]
    });

    console.log("4. Syncing Project Financials...");
    await ProjectService.syncFinancials(project.id);
    const updatedProject = await prisma.project.findUnique({ where: { id: project.id } });
    
    console.log(`Quotation Total: 5000`);
    console.log(`Project Total: ${updatedProject?.totalAmount}`);

    if (Number(updatedProject?.totalAmount) === 5000) {
      console.log("✅ Project synced with edited quotation.");
    } else {
      console.error("❌ DESYNC BUG CONFIRMED: Project total remains at", updatedProject?.totalAmount);
    }
    
    console.log("=== END FLOW 3 TEST ===");
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
