import { prisma } from "@/lib/prisma";
import { CryptoService } from "@/lib/core/security/crypto.service";

export class WebhookService {
  /**
   * Dispatch an outgoing webhook for all subscribed endpoints.
   */
  public static async dispatchEvent(eventType: string, payload: any): Promise<void> {
    const endpoints = await prisma.webhookEndpoint.findMany({
      where: { isActive: true }
    });

    const relevantEndpoints = endpoints.filter(e => {
      const types = JSON.parse(e.eventTypes || "[]");
      return types.includes(eventType) || types.includes("*");
    });

    for (const endpoint of relevantEndpoints) {
      this.sendPayload(endpoint, eventType, payload).catch(err => {
        console.error(`[WebhookService] Failed to deliver ${eventType} to ${endpoint.url}`, err);
      });
    }
  }

  private static async sendPayload(endpoint: any, eventType: string, payload: any) {
    const body = JSON.stringify({ event: eventType, data: payload, timestamp: new Date() });
    
    // We would actually sign it if secret exists
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-RandomFrames-Event": eventType
    };

    if (endpoint.secret) {
      // In production, sign it
      // const signature = crypto.createHmac('sha256', endpoint.secret).update(body).digest('hex');
      // headers['X-RandomFrames-Signature'] = signature;
    }

    try {
      const response = await fetch(endpoint.url, {
        method: "POST",
        headers,
        body
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      await prisma.webhookEndpoint.update({
        where: { id: endpoint.id },
        data: { lastSuccessAt: new Date(), failureCount: 0 }
      });
    } catch (error) {
      await prisma.webhookEndpoint.update({
        where: { id: endpoint.id },
        data: { 
          lastFailureAt: new Date(),
          failureCount: { increment: 1 }
        }
      });
      throw error;
    }
  }
}
