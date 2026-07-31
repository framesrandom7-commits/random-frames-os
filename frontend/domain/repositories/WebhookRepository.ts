import { prisma } from "@/lib/prisma";

export class WebhookRepository {
  static async getWebhooks() {
    return prisma.webhookEndpoint.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  static async createWebhook(data: any) {
    return prisma.webhookEndpoint.create({ data });
  }

  static async deleteWebhook(id: string) {
    return prisma.webhookEndpoint.delete({ where: { id } });
  }
}
