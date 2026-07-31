import { NextResponse } from 'next/server';

import { Logger } from '@/lib/logger';
import crypto from 'crypto';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

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
    
    // Optional: Verify signature if App Secret is configured
    // const signature = request.headers.get('x-hub-signature-256');
    
    const body = JSON.parse(rawBody);

    if (body.object) {
      if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.statuses) {
        const statuses = body.entry[0].changes[0].value.statuses;
        for (const status of statuses) {
          const wamid = status.id; // e.g., wamid.HBg...
          const deliveryStatus = status.status; // sent, delivered, read, failed

          // Ideally, we'd map wamid to our db. For simplicity, we just log it or update by recipient if wamid isn't saved.
          // WhatsAppLog doesn't currently store wamid, so we just log the status globally.
          Logger.info(`WhatsApp Message Status Update: ${deliveryStatus}`, { module: 'WhatsApp', wamid, status: deliveryStatus });
        }
      }

      return new NextResponse('EVENT_RECEIVED', { status: 200 });
    } else {
      return new NextResponse('Not Found', { status: 404 });
    }
  } catch (error: any) {
    Logger.error('WhatsApp Webhook Error', error);
    return new NextResponse('Server Error', { status: 500 });
  }
}
