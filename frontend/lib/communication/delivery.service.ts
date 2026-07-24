import { prisma } from "@/lib/prisma";
import { DeliveryStatus } from "@prisma/client";

export class DeliveryService {
  
  /**
   * Create a new delivery record (Draft)
   */
  public static async createDelivery(data: {
    title: string;
    description?: string;
    deliveryLink: string;
    projectId: string;
    createdBy?: string;
    expiryDate?: Date;
    password?: string;
  }) {
    return prisma.delivery.create({
      data: {
        title: data.title,
        description: data.description,
        deliveryLink: data.deliveryLink,
        status: "DRAFT",
        projectId: data.projectId,
        expiryDate: data.expiryDate,
        password: data.password,
        createdById: data.createdBy,
        versions: {
          create: {
            version: 1,
            deliveryLink: data.deliveryLink,
            changes: "Initial Release"
          }
        }
      }
    });
  }

  /**
   * Mark delivery as sent (fires workflow event separately)
   */
  public static async markAsSent(deliveryId: string) {
    return prisma.delivery.update({
      where: { id: deliveryId },
      data: { status: "SENT", sentAt: new Date() }
    });
  }

  /**
   * Update delivery version (e.g., changes requested)
   */
  public static async pushNewVersion(deliveryId: string, deliveryLink: string, changes: string) {
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { versions: { orderBy: { version: 'desc' }, take: 1 } }
    });
    if (!delivery) throw new Error("Delivery not found");

    const newVersion = delivery.versions.length > 0 ? delivery.versions[0].version + 1 : 1;

    return prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        deliveryLink,
        status: "SENT", // Reset to sent if it was confirmed before
        versions: {
          create: {
            version: newVersion,
            deliveryLink,
            changes
          }
        }
      }
    });
  }

  public static async getDeliveriesForProject(projectId: string) {
    return prisma.delivery.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: { versions: true }
    });
  }
}
