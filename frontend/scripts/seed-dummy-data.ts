import { PrismaClient, ProjectStatus, ProjectPriority, PaymentStatus, LeadStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding dummy data for audit...");

  // Get admin user to assign as createdBy/assignedTo
  const admin = await prisma.user.findFirst({ where: { email: 'admin@randomframes.in' } });
  if (!admin) {
    throw new Error("Admin user not found.");
  }

  console.log("Cleaning up old dummy data...");
  await prisma.expense.deleteMany({ where: { title: { contains: "audit project" } } });
  await prisma.payment.deleteMany({ where: { referenceNumber: { startsWith: "TRX-AUDIT" } } });
  await prisma.invoice.deleteMany({ where: { invoiceNumber: { startsWith: "INV-AUDIT" } } });
  await prisma.project.deleteMany({ where: { projectCode: { startsWith: "AUDIT-PRJ" } } });
  await prisma.client.deleteMany({ where: { email: { startsWith: "client" } } });
  await prisma.lead.deleteMany({ where: { email: { startsWith: "lead" } } });

  // 1. Create 10 Leads
  console.log("Creating 10 Leads...");
  const leads = [];
  for (let i = 1; i <= 10; i++) {
    const lead = await prisma.lead.create({
      data: {
        contactPerson: `Lead Contact ${i}`,
        businessName: `Lead Business ${i}`,
        email: `lead${i}@example.com`,
        phone: `987654321${i % 10}`,
        status: i <= 3 ? "NEW" : (i <= 6 ? "ATTENDED" : (i <= 8 ? "REQUIREMENT_DISCUSSION" : "CONVERTED_TO_CLIENT")),
        leadSource: "WEBSITE",
        notes: `Dummy lead notes for lead ${i}`,
        createdById: admin.id,
      }
    });
    leads.push(lead);
  }

  // 2. Create 5 Clients
  console.log("Creating 5 Clients...");
  const clients = [];
  for (let i = 1; i <= 5; i++) {
    const client = await prisma.client.create({
      data: {
        businessName: `Audit Client ${i} Pvt Ltd`,
        clientCode: `CLI-AUDIT-${i}`,
        contactPerson: `Contact Person ${i}`,
        email: `client${i}@example.com`,
        phone: `876543210${i % 10}`,
        address: `123 Audit Street, Block ${i}`,
        city: "Mumbai",
        state: "MH",
        country: "India",
        postalCode: `40000${i}`,
        gstNumber: `27AAAAA000${i}A1ZA`,
        notes: "Generated for audit purposes.",
        convertedFromLead: { connect: { id: leads[i + 4].id } },
      }
    });
    clients.push(client);
  }

  // 3. Create 8 Projects
  console.log("Creating 8 Projects...");
  for (let i = 1; i <= 8; i++) {
    const client = clients[i % 5];
    const totalAmount = i * 10000;
    const advanceAmount = i % 2 === 0 ? totalAmount * 0.5 : 0;
    const balanceAmount = totalAmount - advanceAmount;
    
    let paymentStatus: PaymentStatus = "PENDING";
    if (advanceAmount > 0) paymentStatus = "PARTIAL";

    const project = await prisma.project.create({
      data: {
        title: `Audit Project ${i} - ${client.businessName}`,
        projectCode: `AUDIT-PRJ-${i}`,
        description: `This is a test project generated for audit purposes.`,
        clientId: client.id,
        status: i <= 2 ? "INQUIRY" : (i <= 5 ? "PLANNED" : (i <= 7 ? "SHOOTING" : "COMPLETED")),
        priority: i % 3 === 0 ? "HIGH" : "MEDIUM",
        category: "EVENT",
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        deliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        quotationAmount: totalAmount,
        totalAmount: totalAmount,
        advanceAmount: advanceAmount,
        balanceAmount: balanceAmount,
        paymentStatus,
        assignedUsers: {
          connect: [{ id: admin.id }]
        }
      }
    });

    // Create Invoice for Project
    console.log(`Creating Invoice and Payments for Project ${project.title}...`);
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-AUDIT-${i}`,
        projectId: project.id,
        clientId: client.id,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        subtotal: totalAmount / 1.18,
        tax: totalAmount - (totalAmount / 1.18),
        total: totalAmount,
        status: paymentStatus === "PARTIAL" ? "PARTIAL" : "DRAFT",
      }
    });

    if (advanceAmount > 0) {
      await prisma.payment.create({
        data: {
          amount: advanceAmount,
          paymentDate: new Date(),
          paymentMethod: "BANK_TRANSFER",
          referenceNumber: `TRX-AUDIT-${i}`,
          projectId: project.id,
          invoiceId: invoice.id,
          clientId: client.id,
        }
      });
    }

    // Add some Expenses
    if (i % 2 === 0) {
      // Need a valid categoryId first. We'll find or create one.
      let category = await prisma.expenseCategory.findFirst();
      if (!category) {
        category = await prisma.expenseCategory.create({ data: { name: 'Travel' } });
      }

      await prisma.expense.create({
        data: {
          title: "Travel expenses for audit project",
          amount: totalAmount * 0.2,
          date: new Date(),
          categoryId: category.id,
          paymentMethod: "BANK_TRANSFER",
          projectId: project.id,
        }
      });
    }
  }

  console.log("Dummy data seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
