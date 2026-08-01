import { prisma } from "../lib/prisma";
import { EventBus } from "../lib/workflow/event-bus";
import { WorkflowEvent } from "../lib/workflow/events";
import { WorkflowEngine } from "../lib/workflow/workflow-engine";

async function testAutomation() {
  console.log("--- Starting Workflow Automation Test ---");

  // 1. Initialize Engine
  // WorkflowEngine.initialize() is called automatically on import
  
  // 2. Setup Dummy Lead
  const lead = await prisma.lead.create({
    data: {
      businessName: "Test Automation Co",
      contactPerson: "Jane Doe",
      phone: "1234567890",
      email: "jane@testauto.com",
    }
  });
  console.log(`Created Lead: ${lead.id}`);

  // 3. Setup Dummy Client
  const client = await prisma.client.create({
    data: {
      businessName: "Test Automation Co",
      contactPerson: "Jane Doe",
      phone: "1234567890",
      email: "jane@testauto.com",
      clientCode: "TAC-001"
    }
  });
  console.log(`Created Client: ${client.id}`);

  // 4. Fire LEAD_CONVERTED_TO_CLIENT
  console.log("\n-> Firing LEAD_CONVERTED Event...");
  EventBus.publish(WorkflowEvent.LEAD_CONVERTED, {
    leadId: lead.id,
    clientId: client.id,
    userId: "system"
  });

  // Wait a moment for async handlers to process
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 5. Verify Project Creation
  const project = await prisma.project.findFirst({
    where: { clientId: client.id }
  });
  
  if (project) {
    console.log(`[SUCCESS] Project automatically created: ${project.id} with status: ${project.status}`);
  } else {
    console.log(`[FAILED] Project was not created.`);
  }

  // 6. Verify Quote Approved -> PLANNING
  if (project) {
    console.log("\n-> Firing QUOTATION_APPROVED Event...");
    EventBus.publish(WorkflowEvent.QUOTATION_APPROVED, {
      quotationId: "dummy-quote",
      projectId: project.id,
      clientId: client.id
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    const projUpdate1 = await prisma.project.findUnique({ where: { id: project.id } });
    console.log(`Status after QUOTE_APPROVED: ${projUpdate1?.status}`);
    
    console.log("\n-> Firing PAYMENT_RECEIVED Event...");
    EventBus.publish(WorkflowEvent.PAYMENT_RECEIVED, {
      paymentId: "dummy-payment",
      amount: 1000,
      projectId: project.id,
      clientId: client.id
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    const projUpdate2 = await prisma.project.findUnique({ where: { id: project.id } });
    console.log(`Status after PAYMENT_RECEIVED: ${projUpdate2?.status}`);

    // Verify Queued Jobs for Notifications
    const queuedJobs = await prisma.integrationJobQueue.findMany({
      where: {
        provider: { in: ['EMAIL', 'WHATSAPP'] },
        status: 'QUEUED'
      }
    });
    console.log(`\n[VERIFIED] Found ${queuedJobs.length} queued notification jobs in IntegrationJobQueue (Email/WhatsApp).`);
    queuedJobs.forEach(job => {
      console.log(` - Provider: ${job.provider}, Action: ${job.action}`);
    });
  }

  // Cleanup
  await prisma.lead.delete({ where: { id: lead.id } });
  await prisma.client.delete({ where: { id: client.id } });
  
  console.log("\n--- Workflow Automation Test Complete ---");
}

testAutomation().catch(console.error);
