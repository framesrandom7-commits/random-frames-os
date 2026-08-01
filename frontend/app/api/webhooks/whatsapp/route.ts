import { NextResponse } from 'next/server';
import { Logger } from '@/lib/logger';
import { WhatsAppDomainService } from '@/domain/whatsapp/service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "randomframes_webhook_secret";

  if (mode && token) {
    if (mode === 'subscribe' && token === verifyToken) {
      Logger.info('WhatsApp Webhook Verified', { module: 'WhatsApp', operation: 'webhook_verification', status: 'SUCCESS' });
      return new NextResponse(challenge, { status: 200 });
    } else {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }
  return new NextResponse('Bad Request', { status: 400 });
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);

    if (body.object || body.entry) {
      // Delegate 100% of webhook parsing and CRM correlation to the WhatsApp Domain Service
      const stats = await WhatsAppDomainService.processWebhookPayload(body);
      Logger.info(`Processed inbound WhatsApp webhook events: ${stats.processedMessages} messages, ${stats.processedStatuses} statuses.`);
      return new NextResponse('EVENT_RECEIVED', { status: 200 });
    } else {
      return new NextResponse('Not Found', { status: 404 });
    }
  } catch (error: any) {
    Logger.error('WhatsApp Webhook Processing Error', error);
    return new NextResponse('Server Error', { status: 500 });
  }
}
