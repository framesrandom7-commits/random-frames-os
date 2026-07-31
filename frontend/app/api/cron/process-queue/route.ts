import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Logger } from '@/lib/logger';
import { DriveService } from '@/lib/drive.service';
import { GCalService } from '@/lib/gcal.service';
import { WhatsAppService } from '@/lib/whatsapp.service';
import { QueueService } from '@/lib/queue.service';

export async function GET(request: Request) {
  // Simple auth for cron (usually Vercel Cron sends a Bearer token or secret)
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const jobs = await prisma.integrationJobQueue.findMany({
      where: {
        status: { in: ['QUEUED', 'FAILED'] },
        nextRetryAt: { lte: new Date() },
        retryCount: { lt: 5 } // Max 5 retries
      },
      take: 10, // Process 10 at a time to prevent timeout
      orderBy: { nextRetryAt: 'asc' }
    });

    for (const job of jobs) {
      await prisma.integrationJobQueue.update({
        where: { id: job.id },
        data: { status: 'RUNNING' }
      });

      let success = false;
      let lastError = '';

      try {
        const payload = job.payload as any;
        if (job.provider === 'GOOGLE_DRIVE') {
          if (job.action === 'CREATE_CLIENT_FOLDERS') {
            success = await DriveService.createClientFolders(payload.clientId, payload.clientName);
          } else if (job.action === 'CREATE_PROJECT_FOLDERS') {
            success = await DriveService.createProjectFolders(payload.projectId, payload.projectName, payload.clientFolderId);
          }
        } else if (job.provider === 'GOOGLE_CALENDAR') {
          if (job.action === 'SYNC_SHOOT_EVENT') {
            success = await GCalService.syncShootEvent(payload.shootId);
          } else if (job.action === 'DELETE_EVENT') {
            success = await GCalService.deleteShootEvent(payload.calendarEventId);
          }
        } else if (job.provider === 'WHATSAPP') {
          if (job.action === 'SEND_TEMPLATE') {
            success = await WhatsAppService.sendTemplateMessage(payload.to, payload.templateName, payload.templateData);
          }
        }
      } catch (err: any) {
        lastError = err.message;
        success = false;
      }

      if (success) {
        await prisma.integrationJobQueue.update({
          where: { id: job.id },
          data: { status: 'COMPLETED' }
        });
      } else {
        await prisma.integrationJobQueue.update({
          where: { id: job.id },
          data: { 
            status: 'FAILED',
            retryCount: job.retryCount + 1,
            nextRetryAt: QueueService.getNextRetryDate(job.retryCount + 1),
            lastError: lastError || 'Operation failed without throwing'
          }
        });
      }
    }

    return NextResponse.json({ processed: jobs.length });
  } catch (error: any) {
    Logger.error('Failed to process retry queue', error);
    return new NextResponse('Server Error', { status: 500 });
  }
}
