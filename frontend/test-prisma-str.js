const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();
async function run() {
  try {
    const res = await prisma.quotation.create({
      data: {
        quotationNumber: 'QUO-9999-003',
        issueDate: new Date(),
        validUntil: new Date(),
        subtotal: 100,
        total: 100,
        client: { connect: { id: 'cmsc57wnx000ch5j62nv7xhyd' } },
        items: {
          create: [
            { description: 'Test', quantity: "1", unitPrice: 100, total: 100 }
          ]
        }
      },
      include: { items: true }
    });
    console.log('Success!', res.id);
  } catch(e) {
    console.error(e.message);
  } finally {
    await prisma.$disconnect();
  }
}
run();
