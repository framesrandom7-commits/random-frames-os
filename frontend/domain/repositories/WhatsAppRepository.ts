import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export class WhatsAppRepository {
  static async getTemplates() {
    return prisma.whatsAppTemplate.findMany({
      orderBy: { name: 'asc' }
    });
  }

  static async getTemplate(id: string) {
    return prisma.whatsAppTemplate.findUnique({
      where: { id }
    });
  }

  static async createTemplate(data: any) {
    return prisma.whatsAppTemplate.create({ data });
  }

  static async updateTemplate(id: string, data: any) {
    return prisma.whatsAppTemplate.update({
      where: { id },
      data
    });
  }

  static async deleteTemplate(id: string) {
    return prisma.whatsAppTemplate.delete({
      where: { id }
    });
  }

  static async logMessage(data: any) {
    return prisma.whatsAppLog.create({ data });
  }

  static async updateLogStatus(id: string, status: any, deliveredAt?: Date) {
    return prisma.whatsAppLog.update({
      where: { id },
      data: { status }
    });
  }

  static async getLogs(where: any, skip?: number, take?: number) {
    return prisma.whatsAppLog.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    });
  }
}
