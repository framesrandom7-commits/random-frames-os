import { GoogleDriveProvider } from './GoogleDriveProvider';
import { prisma } from '@/lib/prisma';
import { StorageFolder } from './StorageProvider';
import { EventBus } from '@/lib/workflow/event-bus';
import { WorkflowEvent } from '@/lib/workflow/events';

async function createHierarchy(provider: GoogleDriveProvider, folderNames: string[], parentId?: string) {
  const folders: Record<string, StorageFolder> = {};
  for (const name of folderNames) {
    const folder = await provider.createFolder(name, parentId);
    folders[name] = folder;
  }
  return folders;
}

export async function createClientStorageFolders(userId: string, clientId: string, clientName: string) {
  const provider = new GoogleDriveProvider(userId);
  await provider.initialize();
  
  // 1. Get or create the root "Random Frames" folder from IntegrationSettings
  const settings = await prisma.integrationSettings.findUnique({
    where: { provider: 'GOOGLE_DRIVE' }
  });
  
  let rootId = settings?.rootFolderId;
  if (!rootId) {
    const rootFolder = await provider.createFolder('Random Frames');
    rootId = rootFolder.id;
    await prisma.integrationSettings.update({
      where: { provider: 'GOOGLE_DRIVE' },
      data: { rootFolderId: rootId, rootFolderUrl: rootFolder.url }
    });
  }
  
  // 2. We should ideally create a "Clients" folder inside root, but for simplicity, we'll assume root -> ClientName
  const clientFolder = await provider.createFolder(`Client: ${clientName}`, rootId);
  
  // 3. Save to database
  await prisma.client.update({
    where: { id: clientId },
    data: {
      driveFolderId: clientFolder.id,
      driveFolderUrl: clientFolder.url
    }
  });
  
  EventBus.publish(WorkflowEvent.FOLDER_CREATED, {
    folderId: clientFolder.id,
    folderUrl: clientFolder.url,
    entityType: 'Client',
    entityId: clientId,
    userId
  });

  return clientFolder;
}

export async function createProjectStorageFolders(userId: string, projectId: string, projectName: string, clientFolderId: string) {
  const provider = new GoogleDriveProvider(userId);
  await provider.initialize();
  
  // 1. Create Project Root
  const projectRoot = await provider.createFolder(`Project: ${projectName}`, clientFolderId);
  
  // 2. Create subfolders
  const subfolders = await createHierarchy(provider, [
    '01_RAW',
    '02_EDITS',
    '03_DELIVERY',
    '04_DOCUMENTS',
    '05_REFERENCES',
    '06_SOCIAL_MEDIA',
    '07_BACKUPS'
  ], projectRoot.id);
  
  // Create RAW subfolders
  await createHierarchy(provider, ['Photos', 'Videos', 'Drone', 'Audio'], subfolders['01_RAW'].id);
  
  // Create EDITS subfolders
  await createHierarchy(provider, ['Photos', 'Videos'], subfolders['02_EDITS'].id);
  
  // Create DELIVERY subfolders
  await createHierarchy(provider, ['Photos', 'Videos'], subfolders['03_DELIVERY'].id);
  
  // 3. Update database
  await prisma.project.update({
    where: { id: projectId },
    data: {
      driveRootFolderId: projectRoot.id,
      driveRootFolderUrl: projectRoot.url,
      rawFolderId: subfolders['01_RAW'].id,
      rawFolderUrl: subfolders['01_RAW'].url,
      editFolderId: subfolders['02_EDITS'].id,
      editFolderUrl: subfolders['02_EDITS'].url,
      deliveryFolderId: subfolders['03_DELIVERY'].id,
      deliveryFolderUrl: subfolders['03_DELIVERY'].url,
      documentsFolderId: subfolders['04_DOCUMENTS'].id,
      documentsFolderUrl: subfolders['04_DOCUMENTS'].url,
      referencesFolderId: subfolders['05_REFERENCES'].id,
      referencesFolderUrl: subfolders['05_REFERENCES'].url,
      socialFolderId: subfolders['06_SOCIAL_MEDIA'].id,
      socialFolderUrl: subfolders['06_SOCIAL_MEDIA'].url,
      backupFolderId: subfolders['07_BACKUPS'].id,
      backupFolderUrl: subfolders['07_BACKUPS'].url,
    }
  });
  
  EventBus.publish(WorkflowEvent.FOLDER_CREATED, {
    folderId: projectRoot.id,
    folderUrl: projectRoot.url,
    entityType: 'Project',
    entityId: projectId,
    userId
  });

  return projectRoot;
}

export async function createShootStorageFolders(userId: string, shootId: string, shootName: string, projectRootFolderId: string) {
  const provider = new GoogleDriveProvider(userId);
  await provider.initialize();
  
  // 1. Create Shoot Root inside the Project Root
  const shootRoot = await provider.createFolder(`Shoot: ${shootName}`, projectRootFolderId);
  
  // 2. Create subfolders
  const subfolders = await createHierarchy(provider, [
    'Camera A',
    'Camera B',
    'Drone',
    'Audio',
    'BTS'
  ], shootRoot.id);
  
  // 3. Update Database
  await prisma.shoot.update({
    where: { id: shootId },
    data: {
      cameraAFolderId: subfolders['Camera A'].id,
      cameraAFolderUrl: subfolders['Camera A'].url,
      cameraBFolderId: subfolders['Camera B'].id,
      cameraBFolderUrl: subfolders['Camera B'].url,
      droneFolderId: subfolders['Drone'].id,
      droneFolderUrl: subfolders['Drone'].url,
      audioFolderId: subfolders['Audio'].id,
      audioFolderUrl: subfolders['Audio'].url,
      btsFolderId: subfolders['BTS'].id,
      btsFolderUrl: subfolders['BTS'].url,
    }
  });
  
  EventBus.publish(WorkflowEvent.FOLDER_CREATED, {
    folderId: shootRoot.id,
    folderUrl: shootRoot.url,
    entityType: 'Shoot',
    entityId: shootId,
    userId
  });

  return shootRoot;
}
