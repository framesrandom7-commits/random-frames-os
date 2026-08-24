import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanDB() {
  console.log("Starting database cleanup...");

  try {
    // Activities & Notifications
    await prisma.activity.deleteMany();
    await prisma.notification.deleteMany();
    
    // Deliverables & Shoots
    await prisma.deliverableFile.deleteMany();
    await prisma.deliverableVersion.deleteMany();
    await prisma.deliverable.deleteMany();
    await prisma.shootEquipment.deleteMany();
    await prisma.shootShot.deleteMany();
    await prisma.shoot.deleteMany();

    // Tasks & Calendar
    await prisma.checklistItem.deleteMany();
    await prisma.task.deleteMany();
    await prisma.calendarEvent.deleteMany();

    // Financials
    await prisma.financialLedger.deleteMany();
    await prisma.paymentAllocation.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.invoiceItem.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.expense.deleteMany();
    await prisma.quotationItem.deleteMany();
    await prisma.quotation.deleteMany();

    // Projects & Approvals
    await prisma.project.deleteMany();
    // await prisma.approval.deleteMany(); // Table doesn't exist yet

    // Leads & Clients
    await prisma.leadTag.deleteMany();
    await prisma.leadAttachment.deleteMany();
    await prisma.leadReminder.deleteMany();
    await prisma.leadCommunication.deleteMany();
    await prisma.lead.deleteMany();
    
    // The Client must be deleted after anything that references it
    await prisma.client.deleteMany();

    console.log("✅ Database successfully wiped (User accounts and settings preserved).");
  } catch (error) {
    console.error("❌ Error cleaning database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDB();
