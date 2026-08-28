import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding finance data for the last 6 months...");

  console.log("Wiping existing finance data...");
  await prisma.payment.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.shoot.deleteMany({ where: { shootCode: { startsWith: 'SHT-FIN' } } });

  // Get admin user
  const admin = await prisma.user.findFirst();
  if (!admin) {
    throw new Error("Admin user not found.");
  }

  // Create or get a client
  let client = await prisma.client.findFirst();
  if (!client) {
    client = await prisma.client.create({
      data: {
        businessName: `Finance Test Client`,
        clientCode: `CLI-FIN-TEST`,
        contactPerson: `John Doe`,
        email: `fin-test@example.com`,
      }
    });
  }

  let project = await prisma.project.findFirst({ where: { clientId: client.id } });
  if (!project) {
    project = await prisma.project.create({
      data: {
        title: `Finance Test Project`,
        projectCode: `FIN-PRJ-TEST`,
        clientId: client.id,
        status: "COMPLETED",
        priority: "MEDIUM",
        category: "ONE_TIME_SHOOT",
        startDate: new Date(),
      }
    });
  }

  // Create an expense category if not exists
  let category = await prisma.expenseCategory.findFirst();
  if (!category) {
    category = await prisma.expenseCategory.create({ data: { name: 'Travel' } });
  }

  const now = new Date();

  // Create data for each of the last 6 months
  for (let i = 5; i >= 0; i--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - i, Math.floor(Math.random() * 25) + 1);
    
    // 1. Create a Quotation
    const quoteAmount = Math.floor(Math.random() * 50000) + 20000;
    await prisma.quotation.create({
      data: {
        quotationNumber: await (await import('../lib/finance/number-generator.service')).NumberGenerator.generateQuotationNumber(),
        issueDate: targetDate,
        validUntil: new Date(targetDate.getTime() + 15 * 24 * 60 * 60 * 1000),
        subtotal: quoteAmount / 1.18,
        tax: quoteAmount - (quoteAmount / 1.18),
        total: quoteAmount,
        status: i % 3 === 0 ? "REJECTED" : "APPROVED",
        clientId: client.id,
      }
    });

    // 2. Create an Invoice
    const invoiceAmount = quoteAmount * (Math.random() > 0.5 ? 1 : 1.2); 
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: await (await import('../lib/finance/number-generator.service')).NumberGenerator.generateInvoiceNumber(),
        clientId: client.id,
        projectId: project.id,
        issueDate: targetDate,
        dueDate: new Date(targetDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        subtotal: invoiceAmount / 1.18,
        tax: invoiceAmount - (invoiceAmount / 1.18),
        total: invoiceAmount,
        status: i === 0 ? "SENT" : "PAID", 
      }
    });

    // 3. Create Payments
    if (i !== 0) { 
      await prisma.payment.create({
        data: {
          amount: invoiceAmount,
          paymentDate: new Date(targetDate.getTime() + 3 * 24 * 60 * 60 * 1000),
          paymentMethod: "UPI",
          referenceNumber: `TRX-FIN-${i}-${Date.now().toString().slice(-4)}`,
          invoiceId: invoice.id,
          projectId: project.id,
          clientId: client.id,
        }
      });
    } else {
      await prisma.payment.create({
        data: {
          amount: invoiceAmount * 0.5,
          paymentDate: new Date(targetDate.getTime() + 1 * 24 * 60 * 60 * 1000),
          paymentMethod: "CASH",
          referenceNumber: `TRX-FIN-PARTIAL-${Date.now().toString().slice(-4)}`,
          invoiceId: invoice.id,
          projectId: project.id,
          clientId: client.id,
        }
      });
    }

    // 4. Create a Shoot
    const shoot = await prisma.shoot.create({
      data: {
        shootCode: `SHT-FIN-${i}-${Date.now().toString().slice(-4)}`,
        title: `Production Shoot for Month ${targetDate.getMonth() + 1}`,
        date: targetDate,
        projectId: project.id,
        clientId: client.id,
        status: "COMPLETED",
      }
    });

    // 5. Create an Expense tied to the Project and Shoot
    // 5. Create multiple Expenses tied to the Project and Shoot
    const expenseTypes = [
      { title: "Camera Rental", factor: 0.1 },
      { title: "Crew Catering", factor: 0.05 },
      { title: "Travel & Logistics", factor: 0.08 },
    ];
    
    for (const exp of expenseTypes) {
      await prisma.expense.create({
        data: {
          title: `${exp.title} - ${shoot.title}`,
          amount: invoiceAmount * exp.factor,
          date: targetDate,
          categoryId: category.id,
          paymentMethod: "CARD",
          projectId: project.id,
          clientId: client.id,
          shootId: shoot.id,
        }
      });
    }
  }

  // Add one overdue invoice for test
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 5);
  await prisma.invoice.create({
    data: {
      invoiceNumber: await (await import('../lib/finance/number-generator.service')).NumberGenerator.generateInvoiceNumber(),
      clientId: client.id,
      projectId: project.id,
      issueDate: lastMonth,
      dueDate: new Date(lastMonth.getTime() + 7 * 24 * 60 * 60 * 1000), 
      subtotal: 15000 / 1.18,
      tax: 15000 - (15000 / 1.18),
      total: 15000,
      status: "OVERDUE", 
    }
  });

  console.log("Finance seeding complete! Graph will now show data across 6 months.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
