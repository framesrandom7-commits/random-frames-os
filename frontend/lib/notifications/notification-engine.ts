import { prisma } from "@/lib/prisma";
import { Logger } from "@/lib/logger";

export interface CreateNotificationDto {
  title: string;
  message?: string;
  type: any; // NotificationType enum from Prisma
  priority?: any; // NotificationPriority enum
  
  // Drill-down relations
  leadId?: string;
  clientId?: string;
  projectId?: string;
  shootId?: string;
  invoiceId?: string;
  userId?: string;
  
  actionUrl?: string;
}

export class NotificationEngineService {
  /**
   * Dispatch an in-app notification and optionally an email/push.
   */
  public async dispatch(data: CreateNotificationDto) {
    try {
      const notification = await prisma.notification.create({
        data: {
          title: data.title,
          message: data.message,
          type: data.type || 'SYSTEM',
          status: 'PENDING',
          priority: data.priority || 'MEDIUM',
          isRead: false,
          
          leadId: data.leadId,
          clientId: data.clientId,
          projectId: data.projectId,
          shootId: data.shootId,
          invoiceId: data.invoiceId,
          userId: data.userId,
          
          actionUrl: data.actionUrl,
        }
      });
      Logger.info(`[NotificationEngine] Dispatched notification: ${data.title}`);
      
      // If priority is HIGH or URGENT, we could hook into email.ts here to send real emails
      return notification;
    } catch (error) {
      Logger.error(`[NotificationEngine] Failed to dispatch notification: ${data.title}`, error);
      throw error;
    }
  }

  /**
   * Mark a notification as read.
   */
  public async markAsRead(id: string) {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true, status: 'COMPLETED' }
    });
  }
}

export const NotificationEngine = new NotificationEngineService();
