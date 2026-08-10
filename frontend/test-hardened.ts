import { createProject } from "./app/actions/project";
import { CreateProjectData } from "./app/actions/project";
import { prisma } from "./lib/prisma";

async function run() {
  console.log("--- RUNNING HARDENED BACKEND VALIDATION TESTS ---");
  
  // 1. Fetch a client
  const client = await prisma.client.findFirst();
  if (!client) {
    console.log("No client found to test with.");
    return;
  }
  console.log(`Using Client: ${client.id}`);

  // Test 1: Try creating without quotationId
  console.log("\n[Test 1] Creating project WITHOUT quotationId");
  const data1: CreateProjectData = {
    clientId: client.id,
    title: "Hack Project 1",
  };
  const res1 = await createProject(data1);
  console.log("Result:", res1);
  if (!res1.success && res1.error) {
    console.log("✅ Passed: Blocked successfully.");
  } else {
    console.log("❌ Failed: Should have been blocked.");
  }

  // Test 2: Try creating with a fake quotationId
  console.log("\n[Test 2] Creating project with FAKE quotationId");
  const data2: CreateProjectData = {
    clientId: client.id,
    title: "Hack Project 2",
    quotationId: "cl_fake_id_123"
  };
  const res2 = await createProject(data2);
  console.log("Result:", res2);
  if (!res2.success && res2.error) {
    console.log("✅ Passed: Blocked successfully.");
  } else {
    console.log("❌ Failed: Should have been blocked.");
  }

  // Test 3: Try creating with unapproved quotation
  console.log("\n[Test 3] Creating project with UNAPPROVED quotation");
  const unapprovedQuote = await prisma.quotation.findFirst({
    where: { status: { not: "APPROVED" } }
  });
  if (unapprovedQuote) {
    const data3: CreateProjectData = {
      clientId: unapprovedQuote.clientId,
      title: "Hack Project 3",
      quotationId: unapprovedQuote.id
    };
    const res3 = await createProject(data3);
    console.log("Result:", res3);
    if (!res3.success && res3.error) {
      console.log("✅ Passed: Blocked successfully.");
    } else {
      console.log("❌ Failed: Should have been blocked.");
    }
  } else {
    console.log("⚠️ Skipped: No unapproved quotation found.");
  }
  
  // Test 4: Financial Sync Test (Dynamic Total)
  // Let's create an approved quotation first
  console.log("\n[Test 4] Testing dynamic financial calculation");
  const quote = await prisma.quotation.create({
    data: {
      clientId: client.id,
      quotationNumber: `TEST-Q-${Date.now()}`,
      status: "APPROVED",
      total: 1000.50,
      subtotal: 1000.50,
      issueDate: new Date(),
      validUntil: new Date(),
    }
  });
  
  const data4: CreateProjectData = {
    clientId: client.id,
    title: "Legit Project",
    quotationId: quote.id,
    additionalChargesAmount: 200, // adding 200 to test if it computes
  };
  
  const res4 = await createProject(data4);
  console.log("Result:", res4);
  
  if (res4.success && res4.project) {
    console.log(`✅ Passed: Project created successfully with totalAmount: ${res4.project.totalAmount}`);
    if (Number(res4.project.totalAmount) === 1200.50) {
      console.log("✅ Passed: Financial dynamic calculation is correct!");
    } else {
      console.log("❌ Failed: Financial calculation is wrong.");
    }
  } else {
    console.log("❌ Failed: Valid project creation blocked.");
  }

}

run().catch(console.error);
