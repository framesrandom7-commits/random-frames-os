const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    console.log("Creating lead...");
    const lead = await prisma.lead.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        status: 'NEW',
        source: 'WEBSITE'
      }
    });
    console.log("Lead created:", lead.id);

    console.log("Converting to client...");
    const client = await prisma.client.create({
      data: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        type: 'INDIVIDUAL',
        status: 'ACTIVE'
      }
    });
    await prisma.lead.update({ where: { id: lead.id }, data: { status: 'CONVERTED', clientId: client.id } });
    console.log("Client created:", client.id);

    console.log("Creating quotation...");
    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber: `Q-${Date.now()}`,
        issueDate: new Date(),
        validUntil: new Date(),
        subtotal: 1000,
        total: 1000,
        clientId: client.id,
        status: 'APPROVED',
        items: {
          create: [
            { description: 'Photography', quantity: 1, unitPrice: 1000, total: 1000 }
          ]
        }
      }
    });
    console.log("Quotation created:", quotation.id);

    console.log("Creating project...");
    // Let's see how projects are created via services.
    // Instead of raw prisma, I should try to use the actions or services to test the ACTUAL business logic!
    
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}
run();
