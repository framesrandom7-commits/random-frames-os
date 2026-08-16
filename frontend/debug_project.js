const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const project = await prisma.project.findFirst({
    orderBy: { createdAt: 'desc' },
    include: {
      client: true,
      assignedUsers: true,
      activities: { orderBy: { createdAt: "desc" } },
      invoices: { where: { status: { not: "CANCELLED" } } },
      payments: true,
      expenses: true,
    }
  });
  console.log(JSON.stringify(project, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
