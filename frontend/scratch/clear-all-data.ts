import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearAllOperationalData() {
  console.log("=========================================");
  console.log("🧹 PURGING ALL OPERATIONAL DATA FOR LIVE TESTING");
  console.log("=========================================\n");

  const safeDelete = async (model: any, name: string) => {
    try {
      if (model && model.deleteMany) {
        const res = await model.deleteMany({});
        console.log(`   Deleted ${res.count || 0} records from ${name}`);
      }
    } catch (e: any) {
      console.log(`   Skipped ${name}: ${e.message.split('\\n')[0]}`);
    }
  };

  try {
    console.log("1. Deleting Activities, Tasks, and Notifications...");
    await safeDelete(prisma.activity, 'Activity');
    await safeDelete(prisma.task, 'Task');
    await safeDelete(prisma.notification, 'Notification');
    await safeDelete(prisma.auditLog, 'AuditLog');

    console.log("2. Deleting Shoot related data...");
    await safeDelete(prisma.shootShot, 'ShootShot');
    await safeDelete(prisma.shootEquipment, 'ShootEquipment');
    
    console.log("3. Deleting Deliverables...");
    await safeDelete(prisma.deliverableVersion, 'DeliverableVersion');
    await safeDelete(prisma.deliverableFile, 'DeliverableFile');
    await safeDelete(prisma.deliverable, 'Deliverable');

    console.log("4. Deleting Financials (Invoices, Quotations, Payments, Expenses)...");
    await safeDelete(prisma.paymentAllocation, 'PaymentAllocation');
    await safeDelete(prisma.invoiceItem, 'InvoiceItem');
    await safeDelete(prisma.quotationItem, 'QuotationItem');
    await safeDelete(prisma.payment, 'Payment');
    await safeDelete(prisma.invoice, 'Invoice');
    await safeDelete(prisma.quotation, 'Quotation');
    await safeDelete(prisma.expense, 'Expense');
    await safeDelete(prisma.financialLedger, 'FinancialLedger');

    console.log("5. Deleting Core Operational Entities (Shoots, Projects, Clients, Vendors)...");
    await safeDelete(prisma.shoot, 'Shoot');
    await safeDelete(prisma.project, 'Project');
    await safeDelete(prisma.client, 'Client');
    await safeDelete(prisma.vendor, 'Vendor');
    
    console.log("6. Deleting any remaining Leads...");
    await safeDelete(prisma.lead, 'Lead');

    console.log("\n=========================================");
    console.log("✅ ALL DUMMY DATA HAS BEEN SUCCESSFULLY WIPED");
    console.log("=========================================\n");

  } catch (error) {
    console.error("❌ Failed to clear data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

clearAllOperationalData();
