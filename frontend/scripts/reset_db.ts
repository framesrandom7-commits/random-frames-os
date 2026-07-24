import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting full database reset (preserving schema & users)...');

  // We delete from bottom-up to respect foreign keys

  const results: Record<string, number> = {};

  // 1. Deliverables (Child of Shoot)
  results['DeliverableFile'] = (await prisma.deliverableFile.deleteMany()).count;
  results['DeliverableVersion'] = (await prisma.deliverableVersion.deleteMany()).count;
  results['Deliverable'] = (await prisma.deliverable.deleteMany()).count;

  // 2. Shoot Data (Child of Shoot)
  results['ShootShot'] = (await prisma.shootShot.deleteMany()).count;
  results['ShootEquipment'] = (await prisma.shootEquipment.deleteMany()).count;

  // 3. Lead Data (Child of Lead)
  results['LeadCommunication'] = (await prisma.leadCommunication.deleteMany()).count;
  results['LeadReminder'] = (await prisma.leadReminder.deleteMany()).count;
  results['LeadAttachment'] = (await prisma.leadAttachment.deleteMany()).count;
  results['LeadTag'] = (await prisma.leadTag.deleteMany()).count;

  // 4. Standalone/Child of Multiple
  results['Activity'] = (await prisma.activity.deleteMany()).count;
  results['CalendarEvent'] = (await prisma.calendarEvent.deleteMany()).count;
  results['Notification'] = (await prisma.notification.deleteMany()).count;

  // 5. Finance
  results['Payment'] = (await prisma.payment.deleteMany()).count;
  results['Expense'] = (await prisma.expense.deleteMany()).count;
  results['Invoice'] = (await prisma.invoice.deleteMany()).count;

  // 6. Core Entities (Bottom up: Shoot -> Project -> Lead / Client)
  results['Shoot'] = (await prisma.shoot.deleteMany()).count;
  results['Project'] = (await prisma.project.deleteMany()).count;
  
  // Leads can be converted to Clients, but Lead convertedToClient is optional.
  // Actually Lead has convertedToClientId referencing Client. So delete Lead first.
  results['Lead'] = (await prisma.lead.deleteMany()).count;
  results['Client'] = (await prisma.client.deleteMany()).count;
  
  // Tags (Optional to delete, but usually user-created business data)
  results['Tag'] = (await prisma.tag.deleteMany()).count;

  console.log('\nReset Complete! Records deleted:');
  Object.entries(results).forEach(([table, count]) => {
    console.log(`- ${table}: ${count}`);
  });
}

main()
  .catch((e) => {
    console.error('Error resetting database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
