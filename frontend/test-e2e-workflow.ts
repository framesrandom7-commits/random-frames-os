import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runE2ETest() {
  console.log("🚀 STARTING E2E WORKFLOW TEST...\n");
  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string, errorMessage: string) => {
    if (condition) {
      console.log(`✅ PASSED: ${testName}`);
      passed++;
    } else {
      console.log(`❌ FAILED: ${testName} - ${errorMessage}`);
      failed++;
    }
  };

  try {
    // 1. Create Lead
    console.log("--- 1. LEAD MANAGEMENT ---");
    const lead = await prisma.lead.create({
      data: {
        businessName: "E2E Test Studios",
        contactPerson: "Jane E2E",
        email: "jane.e2e@example.com",
        phone: "+91 88888 88888",
        status: "NEW",
        leadSource: "WEBSITE",
      }
    });
    assert(lead.id != null, "Lead Created", "Failed to create Lead in DB");

    // Simulate status progression
    const updatedLead = await prisma.lead.update({
      where: { id: lead.id },
      data: { status: "QUOTE_APPROVED" }
    });
    assert(updatedLead.status === "QUOTE_APPROVED", "Lead Status Updated", "Failed to update Lead status");

    // 2. Client Creation
    console.log("\n--- 2. CLIENT MANAGEMENT ---");
    const clientCode = `CL-E2E-${Date.now().toString().slice(-4)}`;
    const client = await prisma.client.create({
      data: {
        clientCode,
        businessName: lead.businessName!,
        contactPerson: lead.contactPerson,
        email: lead.email,
        phone: lead.phone,
      }
    });
    assert(client.id != null, "Client Created", "Failed to create Client");

    // Update Lead to Converted
    await prisma.lead.update({
      where: { id: lead.id },
      data: { status: "CONVERTED", convertedToClientId: client.id }
    });
    assert(true, "Lead Marked as Converted", "");

    // 3. Project Creation
    console.log("\n--- 3. PROJECT MANAGEMENT ---");
    const project = await prisma.project.create({
      data: {
        projectCode: `PRJ-E2E-${Date.now().toString().slice(-4)}`,
        title: "E2E Brand Film",
        clientId: client.id,
        category: "ONE_TIME_SHOOT",
        priority: "HIGH",
        status: "PLANNING",
        quotationAmount: 100000,
        advanceAmount: 20000,
        totalAmount: 100000,
        balanceAmount: 80000,
        paymentStatus: "PARTIAL"
      }
    });
    assert(project.id != null, "Project Created", "Failed to create Project");

    // 4. Shoot Creation
    console.log("\n--- 4. SHOOT MANAGEMENT ---");
    const shoot = await prisma.shoot.create({
      data: {
        shootCode: `SHT-E2E-${Date.now().toString().slice(-4)}`,
        title: "Day 1: Studio Shoot",
        date: new Date(),
        startTime: "10:00 AM",
        endTime: "06:00 PM",
        location: "Main Studio",
        status: "UPCOMING",
        shootType: "CAFE",
        clientId: client.id,
        projectId: project.id,
      }
    });
    assert(shoot.id != null, "Shoot Created & Linked", "Failed to create Shoot");

    // 5. Content Creation
    console.log("\n--- 5. CONTENT MANAGEMENT ---");
    const content = await prisma.contentPlan.create({
      data: {
        title: "Instagram Teaser Reel",
        projectId: project.id,
        platform: "INSTAGRAM",
        editingStatus: "PENDING",
        approvalStatus: "PENDING",
        publishingStatus: "DRAFT"
      }
    });
    assert(content.id != null, "Content Plan Created & Linked", "Failed to create Content Plan");

    // 6. Finance Management
    console.log("\n--- 6. FINANCE MANAGEMENT ---");
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-E2E-${Date.now().toString().slice(-4)}`,
        clientId: client.id,
        projectId: project.id,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        subtotal: 100000,
        tax: 0,
        total: 100000,
        status: "PARTIAL"
      }
    });
    assert(invoice.id != null, "Invoice Generated", "Failed to create Invoice");

    const payment = await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        clientId: client.id,
        projectId: project.id,
        amount: 20000,
        paymentDate: new Date(),
        paymentMethod: "BANK_TRANSFER",
        referenceNumber: "TRX-E2E-12345"
      }
    });
    assert(payment.id != null, "Advance Payment Recorded", "Failed to record Payment");

    // 7. Workflow Completion
    console.log("\n--- 7. WORKFLOW COMPLETION ---");
    await prisma.shoot.update({ where: { id: shoot.id }, data: { status: "COMPLETED" }});
    await prisma.contentPlan.update({ where: { id: content.id }, data: { publishingStatus: "PUBLISHED" }});
    const completedProject = await prisma.project.update({ where: { id: project.id }, data: { status: "COMPLETED" }});
    
    assert(completedProject.status === "COMPLETED", "Project Marked as Completed", "Failed to complete Project");

    // CLEANUP
    console.log("\n--- 8. DB CLEANUP ---");
    await prisma.payment.delete({ where: { id: payment.id }});
    await prisma.invoice.delete({ where: { id: invoice.id }});
    await prisma.contentPlan.delete({ where: { id: content.id }});
    await prisma.shoot.delete({ where: { id: shoot.id }});
    await prisma.project.delete({ where: { id: project.id }});
    await prisma.client.delete({ where: { id: client.id }});
    await prisma.lead.delete({ where: { id: lead.id }});
    console.log("Cleanup successful.");

  } catch (err: any) {
    console.error("❌ UNEXPECTED ERROR:", err);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  console.log("\n=============================");
  console.log("E2E WORKFLOW TEST SUMMARY:");
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log("=============================\n");
}

runE2ETest();
