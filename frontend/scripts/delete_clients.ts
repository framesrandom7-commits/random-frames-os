import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- DB Deletion Script Started ---');
  
  // 1. Gather counts BEFORE
  const countsBefore = {
    Client: await prisma.client.count(),
    Project: await prisma.project.count(),
    Shoot: await prisma.shoot.count(),
    Invoice: await prisma.invoice.count(),
    Payment: await prisma.payment.count(),
    Expense: await prisma.expense.count(),
    Activity: await prisma.activity.count(),
    CalendarEvent: await prisma.calendarEvent.count(),
    Deliverable: await prisma.deliverable.count(),
    ShootEquipment: await prisma.shootEquipment.count(),
    ShootShot: await prisma.shootShot.count(),
    Notification: await prisma.notification.count(),
  };

  console.log('Counts Before:', countsBefore);

  // 2. Resolve Restrict Constraints
  // Lead.convertedToClientId doesn't have cascade/setnull explicitly, so it defaults to Restrict.
  const updatedLeads = await prisma.lead.updateMany({
    where: {
      convertedToClientId: {
        not: null
      }
    },
    data: {
      convertedToClientId: null
    }
  });
  console.log(`Updated ${updatedLeads.count} leads to remove client references.`);

  // 3. Delete Clients
  console.log('Deleting all clients...');
  try {
    const deletedClients = await prisma.client.deleteMany({});
    console.log(`Successfully deleted ${deletedClients.count} clients directly via Prisma.`);
  } catch (error) {
    console.error('Error during deletion:', error);
  }

  // 4. Gather counts AFTER
  const countsAfter = {
    Client: await prisma.client.count(),
    Project: await prisma.project.count(),
    Shoot: await prisma.shoot.count(),
    Invoice: await prisma.invoice.count(),
    Payment: await prisma.payment.count(),
    Expense: await prisma.expense.count(),
    Activity: await prisma.activity.count(),
    CalendarEvent: await prisma.calendarEvent.count(),
    Deliverable: await prisma.deliverable.count(),
    ShootEquipment: await prisma.shootEquipment.count(),
    ShootShot: await prisma.shootShot.count(),
    Notification: await prisma.notification.count(),
  };

  console.log('\n--- DELETION REPORT ---');
  console.log('Table | Deleted Records');
  console.log('------------------------');
  for (const [table, beforeCount] of Object.entries(countsBefore)) {
    const afterCount = countsAfter[table as keyof typeof countsAfter];
    const diff = beforeCount - afterCount;
    if (diff > 0) {
      console.log(`${table}: ${diff}`);
    } else if (table === 'Client') {
      console.log(`Client: 0 (No records existed)`);
    }
  }

  console.log('\nRemaining Clients:', countsAfter.Client);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
