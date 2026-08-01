import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Logger } from '@/lib/logger';
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
            const { DriveDomainService } = await import('@/domain/drive/service');
            await DriveDomainService.createClientFolders(payload.clientId, payload.clientName);
            success = true;
          } else if (job.action === 'CREATE_PROJECT_FOLDERS') {
            const { DriveDomainService } = await import('@/domain/drive/service');
            await DriveDomainService.createProjectFolders(payload.projectId, payload.projectName, payload.clientFolderId || payload.clientDriveFolderId);
            success = true;
          }
        } else if (job.provider === 'GOOGLE_CALENDAR') {
          const { CalendarDomainService } = await import('@/domain/calendar/service');
          if (job.action === 'SYNC_GOOGLE_CALENDAR') {
            await CalendarDomainService.syncEventToGoogle(payload.crmEventId);
            success = true;
          } else if (job.action === 'DELETE_GOOGLE_CALENDAR_EVENT') {
            await CalendarDomainService.deleteGoogleEvent(payload.googleEventId);
            success = true;
          }
        } else if (job.provider === 'WHATSAPP') {
          const { WhatsAppDomainService } = await import('@/domain/whatsapp/service');
          await WhatsAppDomainService.executeQueuedJob(job.action, payload, job.id);
          success = true;
        } else if (job.provider === 'EMAIL') {
          const { EmailDomainService } = await import('@/domain/email/service');
          if (job.action === 'SEND_EMAIL') {
            const result = await EmailDomainService.sendEmail({
              to: payload.to,
              subject: payload.subject,
              body: payload.body
            });
            success = result.success;
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
