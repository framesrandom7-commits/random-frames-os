import { NextResponse } from 'next/server';
import { verifySession as getSession } from '@/lib/auth';
import { StorageService } from '@/lib/storage/StorageService';
import { GoogleDriveProvider } from '@/lib/storage/GoogleDriveProvider';
import { Logger } from '@/lib/logger';

export const maxDuration = 300; // 5 minutes limit for serverless functions (Vercel)

export async function POST(request: Request) {
  const session = await getSession();
  
  if (!session || !session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folderId = formData.get('folderId') as string;

    if (!file || !folderId) {
      return NextResponse.json({ error: 'Missing file or folderId' }, { status: 400 });
    }

    const storageService = new StorageService(session.userId);
    await storageService.initialize();

    // Access underlying provider to perform the upload
    // In a highly abstract setup, we'd add upload() to StorageProvider interface.
    // For now, we interact with GoogleDriveProvider specifically if needed,
    // or we can add upload() to StorageService. Let's assume we add it to StorageService in a moment.

    // Using Google Drive specific approach:
    const provider = (storageService as any).provider as GoogleDriveProvider;
    const drive = (provider as any).drive;

    if (!drive) {
      throw new Error('Google Drive Provider not initialized properly');
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // We import Readable here so it's only required in Node environment
    const { Readable } = await import('stream');
    const stream = Readable.from(buffer);

    // Perform upload
    const response = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: [folderId],
      },
      media: {
        mimeType: file.type || 'application/octet-stream',
        body: stream, 
      },
      fields: 'id, name, webViewLink, webContentLink',
    });

    Logger.info(`Uploaded file ${file.name}`, { module: 'UploadAPI', operation: 'upload', status: 'SUCCESS', size: file.size });
    
    return NextResponse.json({ success: true, file: response.data });
  } catch (error: any) {
    Logger.error('Upload failed', error, { module: 'UploadAPI', operation: 'upload', status: 'ERROR' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
