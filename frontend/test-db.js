const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.notification.findMany().then(n => console.log('Total notifications:', n.length, 'Pending:', n.filter(x => x.status === 'PENDING').length)).catch(console.error).finally(() => prisma.$disconnect());
