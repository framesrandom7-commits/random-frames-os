"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NotificationType, NotificationStatus, NotificationPriority } from "@prisma/client";

export async function getNotifications(filter?: { status?: NotificationStatus }) {
  const where: any = {};
  if (filter?.status) {
    where.status = filter.status;
  }
  
  return await prisma.notification.findMany({
    where,
    orderBy: { dueDate: 'asc' },
    include: {
      lead: { select: { id: true, businessName: true } },
      client: { select: { id: true, businessName: true } },
      project: { select: { id: true, title: true } },
      shoot: { select: { id: true, title: true } },
      invoice: { select: { id: true, invoiceNumber: true } }
    }
  });
}

export async function markAsRead(id: string) {
  // Mark as read doesn't exist explicitly in our schema, but we can assume dismissing or completing it means read
  // For now, let's say "read" is just leaving it pending, but we'll add a "isRead" boolean if needed. 
  // Wait, let's just mark it as DISMISSED if they want to clear it from the bell, or we can just leave it.
  // Actually, let's just mark as DISMISSED.
  await prisma.notification.update({
    where: { id },
    data: { status: 'DISMISSED' }
  });
  revalidatePath('/notifications');
  revalidatePath('/dashboard');
}

export async function markAllAsRead() {
  await prisma.notification.updateMany({
    where: { status: 'PENDING' },
    data: { status: 'DISMISSED' }
  });
  revalidatePath('/notifications');
  revalidatePath('/dashboard');
}

export async function updateNotificationStatus(id: string, status: NotificationStatus) {
  await prisma.notification.update({
    where: { id },
    data: { status }
  });
  revalidatePath('/notifications');
  revalidatePath('/dashboard');
}

export async function snoozeNotification(id: string, days: number = 1) {
  const snoozedUntil = new Date();
  snoozedUntil.setDate(snoozedUntil.getDate() + days);
  
  await prisma.notification.update({
    where: { id },
    data: { 
      status: 'SNOOZED',
      snoozedUntil
    }
  });
  revalidatePath('/notifications');
  revalidatePath('/dashboard');
}

export async function deleteNotification(id: string) {
  await prisma.notification.delete({
    where: { id }
  });
  revalidatePath('/notifications');
  revalidatePath('/dashboard');
}

export async function createReminder(data: {
  title: string;
  message?: string;
  type: NotificationType;
  priority: NotificationPriority;
  dueDate?: Date;
  leadId?: string;
  projectId?: string;
}) {
  await prisma.notification.create({
    data: {
      title: data.title,
      message: data.message,
      type: data.type,
      priority: data.priority,
      dueDate: data.dueDate,
      status: 'PENDING',
      leadId: data.leadId,
      projectId: data.projectId,
    }
  });
  revalidatePath('/notifications');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function syncAutomatedNotifications() {
  const now = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(now.getDate() + 3);

  // 1. Invoices Due Soon
  const upcomingInvoices = await prisma.invoice.findMany({
    where: {
      status: { in: ['SENT', 'PARTIAL'] },
      dueDate: { lte: threeDaysFromNow, gte: now }
    }
  });

  for (const inv of upcomingInvoices) {
    // Check if notification already exists
    const exists = await prisma.notification.findFirst({
      where: { invoiceId: inv.id, type: 'INVOICE_DUE' }
    });
    if (!exists) {
      await prisma.notification.create({
        data: {
          title: `Invoice ${inv.invoiceNumber} Due Soon`,
          message: `Payment is due on ${inv.dueDate.toLocaleDateString()}`,
          type: 'INVOICE_DUE',
          priority: 'HIGH',
          dueDate: inv.dueDate,
          invoiceId: inv.id,
          clientId: inv.clientId,
          projectId: inv.projectId
        }
      });
    }
  }

  // 2. Overdue Invoices
  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      status: { in: ['SENT', 'PARTIAL'] },
      dueDate: { lt: now }
    }
  });

  for (const inv of overdueInvoices) {
    const exists = await prisma.notification.findFirst({
      where: { invoiceId: inv.id, type: 'OVERDUE_PAYMENT' }
    });
    if (!exists) {
      await prisma.notification.create({
        data: {
          title: `Invoice ${inv.invoiceNumber} is Overdue!`,
          message: `Payment was due on ${inv.dueDate.toLocaleDateString()}`,
          type: 'OVERDUE_PAYMENT',
          priority: 'URGENT',
          dueDate: inv.dueDate,
          invoiceId: inv.id,
          clientId: inv.clientId,
          projectId: inv.projectId
        }
      });
    }
  }

  // 3. Upcoming Shoots
  const upcomingShoots = await prisma.shoot.findMany({
    where: {
      status: { in: ['PLANNED', 'CONFIRMED'] },
      date: { lte: threeDaysFromNow, gte: now }
    }
  });

  for (const shoot of upcomingShoots) {
    if(!shoot.date) continue;
    const exists = await prisma.notification.findFirst({
      where: { shootId: shoot.id, type: 'SHOOT_REMINDER' }
    });
    if (!exists) {
      await prisma.notification.create({
        data: {
          title: `Upcoming Shoot: ${shoot.title}`,
          message: `Scheduled for ${shoot.date.toLocaleDateString()} at ${shoot.startTime || 'TBD'}`,
          type: 'SHOOT_REMINDER',
          priority: 'HIGH',
          dueDate: shoot.date,
          shootId: shoot.id,
          clientId: shoot.clientId,
          projectId: shoot.projectId
        }
      });
    }
  }

  // 4. Project Deadlines
  const upcomingProjects = await prisma.project.findMany({
    where: {
      status: { in: ['SHOOTING', 'EDITING', 'REVIEW'] },
      deliveryDate: { lte: threeDaysFromNow, gte: now }
    }
  });

  for (const proj of upcomingProjects) {
    if(!proj.deliveryDate) continue;
    const exists = await prisma.notification.findFirst({
      where: { projectId: proj.id, type: 'PROJECT_DEADLINE' }
    });
    if (!exists) {
      await prisma.notification.create({
        data: {
          title: `Project Deadline: ${proj.title}`,
          message: `Delivery due by ${proj.deliveryDate.toLocaleDateString()}`,
          type: 'PROJECT_DEADLINE',
          priority: 'HIGH',
          dueDate: proj.deliveryDate,
          projectId: proj.id,
          clientId: proj.clientId
        }
      });
    }
  }
}
