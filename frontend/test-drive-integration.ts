import { prisma } from "./lib/prisma";
import { DriveDomainService } from "./domain/drive/service";
import { WorkspaceDriveService } from "./domain/google/drive/service";

async function main() {
  console.log("Starting Drive Integration Test...");
  try {
    // 1. Check IntegrationSettings
    const settings = await prisma.integrationSettings.findUnique({
      where: { provider: "GOOGLE_DRIVE" }
    });
    
    if (!settings || !settings.accessToken) {
      console.error("❌ GOOGLE_DRIVE Integration is NOT connected. No access token found.");
      return;
    }
    console.log("✅ Drive is connected.");
    if (!settings.rootFolderId) {
      console.warn("⚠️ rootFolderId is NOT set in Settings. It will fallback to 'RANDOM FRAMES/Clients' creation logic or throw an error based on our recent changes.");
    } else {
      console.log(`✅ rootFolderId is set: ${settings.rootFolderId}`);
    }

    // 2. Create a dummy client in DB
    const clientName = "Test Client " + Date.now();
    console.log(`Creating dummy client: ${clientName}`);
    const client = await prisma.client.create({
      data: {
        businessName: clientName,
        firstName: "Test",
        lastName: "User",
        email: `test-${Date.now()}@example.com`,
      }
    });
    console.log(`✅ Client created in DB with ID: ${client.id}`);

    // 3. Test Drive folder creation
    console.log("Triggering createClientFolders...");
    await DriveDomainService.createClientFolders(client.id, client.businessName);
    
    const updatedClient = await prisma.client.findUnique({ where: { id: client.id } });
    console.log("✅ Client Folders Created! driveFolderId:", updatedClient?.driveFolderId);

    // 4. Create dummy project in DB
    console.log("Creating dummy project...");
    const projectName = "Test Project " + Date.now();
    const project = await prisma.project.create({
      data: {
        title: projectName,
        projectCode: "PRJ-" + Date.now(),
        clientId: client.id,
      }
    });
    console.log(`✅ Project created in DB with ID: ${project.id}`);

    // 5. Test Project Drive folder creation
    console.log("Triggering createProjectFolders...");
    if (updatedClient?.driveFolderId) {
      await DriveDomainService.createProjectFolders(project.id, project.title, updatedClient.driveFolderId);
      const updatedProject = await prisma.project.findUnique({ where: { id: project.id } });
      console.log("✅ Project Folders Created! driveRootFolderId:", updatedProject?.driveRootFolderId);
    } else {
       console.error("❌ Cannot create project folders, client driveFolderId is missing.");
    }
    
  } catch (err: any) {
    console.error("❌ Test Failed with error:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
