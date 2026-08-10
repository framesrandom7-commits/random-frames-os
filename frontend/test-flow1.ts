import { LeadService } from "./domain/services/LeadService";
import { ClientService } from "./domain/services/ClientService";
import { FinanceService } from "./domain/services/FinanceService";
import { ProjectService } from "./domain/services/ProjectService";
import { PrismaClient, LeadStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function run() {
  try {
    console.log("=== STARTING FLOW 1 TEST ===");
    
    console.log("1. Creating Lead...");
    const lead = await LeadService.createLead({
      businessName: "Test Business Flow 1",
      contactPerson: "Test Person",
      email: "test.flow1@example.com",
      phone: "9998887776",
      status: "NEW",
      leadSource: "WEBSITE"
    } as any);
    console.log("Lead created:", lead.id);

    console.log("2. Converting to Client...");
    await LeadService.convertLead(lead.id);
    
    const client = await prisma.client.findFirst({ where: { email: "test.flow1@example.com" } });
    if (!client) throw new Error("Client not found after conversion");
    console.log("Client created:", client.id);

    console.log("3. Creating Quotation...");
    const quoData = {
      quotationNumber: `Q-${Date.now()}`,
      issueDate: new Date(),
      validUntil: new Date(),
      subtotal: 1000,
      total: 1000,
      clientId: client.id,
      status: "APPROVED",
      items: [
        { description: "Photography", quantity: 1, unitPrice: 1000, total: 1000 }
      ]
    };
    const quotation = await FinanceService.createQuotation(quoData);
    console.log("Quotation created:", quotation.id);

    console.log("4. Creating Project...");
    const project = await ProjectService.create({
      title: "Flow 1 Project",
      clientId: client.id,
      category: "ONE_TIME_SHOOT",
      status: "PLANNING",
      priority: "MEDIUM",
      paymentStatus: "PENDING",
      quotationId: quotation.id,
      quotationAmount: 1000, 
      additionalServicesAmount: 200,
      additionalChargesAmount: 0,
      discountAmount: 100,
      taxAmount: 0,
      advanceAmount: 0,
      totalAmount: 1100,
      balanceAmount: 1100
    } as any);
    console.log("Project created:", project.id);

    console.log("5. Testing Finance Sync...");
    await ProjectService.syncFinancials(project.id);
    const updatedProject = await prisma.project.findUnique({ where: { id: project.id } });
    console.log("Project total after sync:", updatedProject?.totalAmount);

    if (Number(updatedProject?.totalAmount) === 1100) {
      console.log("✅ Finance logic verified.");
    } else {
      console.error("❌ Finance logic failed. Expected 1100, got", updatedProject?.totalAmount);
    }
    
    console.log("=== END FLOW 1 TEST ===");
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
