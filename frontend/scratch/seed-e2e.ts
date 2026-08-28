import { prisma } from "../lib/prisma";
import { ClientService } from "../domain/services/ClientService";
import { ProjectService } from "../domain/services/ProjectService";
import { ShootService } from "../domain/services/ShootService";
import { InvoiceEngine } from "../domain/finance/invoice-engine";
import { PaymentEngine } from "../domain/finance/payment-engine";
import { WorkspaceDriveService } from "../domain/google/drive/service";
import { EventBus } from "../lib/workflow/event-bus";
import { WorkflowEvent } from "../lib/workflow/events";
import { WorkspaceWorkflowEngine } from "../domain/google/workflow-handlers";

async function run() {
  console.log("🚀 Starting E2E Mock Data Seed for OS Testing...");

  // Register Event Handlers to ensure side-effects (like Drive) trigger
  WorkspaceWorkflowEngine.registerWorkspaceEvents();

  try {
    // 1. Create a Client
    console.log("👤 Creating test client...");
    const client = await ClientService.create({
      businessName: "Acme Corp E2E Test",
      contactPerson: "John Doe",
      email: "test.acme@example.com",
      phone: "+1234567890",
      businessType: "CORPORATE",
      address: "123 Test Ave, Silicon Valley",
      city: "San Francisco",
      state: "CA",
      country: "USA",
      postalCode: "94105",
      preferredContactMethod: "EMAIL",
    } as any);
    console.log(`✅ Client created with ID: ${client.id}`);

    // Wait a sec for EventBus to create Client Drive folder if applicable
    await new Promise((res) => setTimeout(res, 2000));

    // 2. Plan a Project
    console.log("📁 Planning a project...");
    const project = await ProjectService.create({
      title: "Acme Summer Ad Campaign",
      clientId: client.id,
      category: "ONE_TIME_SHOOT",
      priority: "HIGH",
      status: "PLANNING",
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000 * 7), // 7 days from now
      deliveryDate: new Date(Date.now() + 86400000 * 14), // 14 days from now
      quotationAmount: 5000,
      notes: "High priority commercial shoot for Acme Corp summer line.",
    } as any);
    console.log(`✅ Project created with ID: ${project.id}`);

    // Create Drive Folder for Project explicitly if it doesn't exist
    console.log("☁️ Provisioning Google Drive folder for Project...");
    await WorkspaceDriveService.repairFolderHierarchy("PROJECT", project.id);
    
    // 3. Plan a Shoot with Service and Charges
    console.log("🎥 Planning a shoot...");
    const shootCode = `SH${new Date().getTime().toString().slice(-6)}`;
    const shoot = await prisma.shoot.create({
      data: {
        shootCode,
        title: "Acme Commercial Video Shoot",
        projectId: project.id,
        clientId: client.id,
        shootType: "PRODUCT",
        date: new Date(Date.now() + 86400000 * 3),
        startTime: "09:00",
        endTime: "17:00",
        location: "Studio 1, Creative Hub",
        photographer: "Jane Smith",
        videographer: "Alex Johnson",
        status: "COMPLETED",
        notes: "Full day shoot for the summer campaign."
      }
    });
    console.log(`✅ Shoot created with ID: ${shoot.id}`);

    // 4. Create an Invoice
    console.log("💰 Generating Invoice...");
    const invoice = await InvoiceEngine.generateInvoiceFromProject(project.id, {
      invoiceType: "FINAL",
      dueDate: new Date(Date.now() + 86400000 * 30), // 30 days
      notes: "Final invoice for the Summer Ad Campaign shoot.",
      items: [
        { description: "Commercial Video Production", quantity: 1, unitPrice: 3500 },
        { description: "Studio Rental & Equipment", quantity: 1, unitPrice: 1500 },
      ],
      tax: 250, // Flat tax for testing
      discount: 0
    });
    console.log(`✅ Invoice created with ID: ${invoice.id} (Total: $${invoice.total})`);

    // 5. Create a Payment Receipt
    console.log("💳 Registering Payment...");
    const payment = await PaymentEngine.recordPayment({
      amount: Number(invoice.total),
      paymentDate: new Date(),
      paymentMethod: "BANK_TRANSFER",
      paymentType: "FULL",
      referenceNumber: "TXN-E2E-999888",
      invoiceId: invoice.id,
      projectId: project.id,
      clientId: client.id,
      notes: "Paid in full via Bank Transfer"
    });
    console.log(`✅ Payment Receipt created with ID: ${payment.id}`);

    // Let events settle
    await new Promise((res) => setTimeout(res, 2000));
    
    console.log("🎉 E2E Test Data successfully seeded!");

  } catch (error) {
    console.error("❌ Failed to seed E2E Test Data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
