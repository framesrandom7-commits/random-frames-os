"use server";

import { prisma } from "@/lib/prisma";
import { getSettings } from "./settings";

/**
 * Validates the client ID and throws if not found
 */
async function validateClient(clientId: string) {
  if (!clientId) throw new Error("Client ID is required");
  const client = await prisma.client.findUnique({
    where: { id: clientId }
  });
  if (!client) throw new Error("Client not found");
  return client;
}

/**
 * Gets high-level dashboard metrics and branding info for the portal
 */
export async function getPortalDashboard(clientId: string) {
  const client = await validateClient(clientId);
  const settings = await getSettings();

  // Active Projects
  const activeProjectsCount = await prisma.project.count({
    where: { 
      clientId,
      status: { notIn: ["COMPLETED", "CANCELLED"] }
    }
  });

  // Upcoming Shoots
  const upcomingShootsCount = await prisma.shoot.count({
    where: {
      project: { clientId },
      status: { notIn: ["COMPLETED", "CANCELLED"] },
      date: { gte: new Date() }
    }
  });

  // Outstanding Balance
  // Assuming total balance is the sum of unpaid invoice balances
  const invoices = await prisma.invoice.findMany({
    where: { 
      clientId,
      status: { notIn: ["PAID", "CANCELLED"] }
    }
  });
  
  const outstandingBalance = invoices.reduce((sum, inv) => {
    return sum + (Number(inv.total) - Number(inv.amountPaid || 0));
  }, 0);

  // Recent Activities
  const recentActivities = await prisma.activity.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
    take: 5
  });

  // Basic payment info for the dashboard
  const paymentInfo = {
    upiId: settings.PAYMENT_UPI_ID || "",
    qrCodeDataUrl: settings.PAYMENT_UPI_QR_URL || "",
    bankAccount: {
      bankName: settings.PAYMENT_BANK_NAME || "",
      accountName: settings.PAYMENT_BANK_HOLDER || "",
      accountNumber: settings.PAYMENT_BANK_ACCOUNT || "",
      ifscCode: settings.PAYMENT_BANK_IFSC || ""
    }
  };

  return {
    clientIdentity: {
      businessName: client.businessName,
      contactPerson: client.contactPerson || "Client",
      email: client.email || "",
      phone: client.phone || "",
      driveUrl: client.driveFolderUrl || ""
    },
    activeProjectsCount,
    upcomingShootsCount,
    outstandingBalance,
    recentActivities,
    branding: {
      businessName: settings.company?.businessName || "Random Frames",
      primaryColor: settings.primaryColor || "#3B82F6",
      supportEmail: settings.company?.email || "",
      supportPhone: settings.company?.phone || ""
    },
    paymentInfo
  };
}

/**
 * Gets all shoots related to the client
 */
export async function getPortalShoots(clientId: string) {
  await validateClient(clientId);
  return await prisma.shoot.findMany({
    where: { project: { clientId } },
    include: { project: { select: { title: true } } },
    orderBy: { date: "asc" }
  });
}

/**
 * Gets all invoices and payments for the client
 */
export async function getPortalInvoices(clientId: string) {
  await validateClient(clientId);
  const invoices = await prisma.invoice.findMany({
    where: { clientId },
    include: { project: { select: { title: true } } },
    orderBy: { issueDate: "desc" }
  });
  
  const payments = await prisma.payment.findMany({
    where: { clientId },
    include: { invoice: { select: { invoiceNumber: true } } },
    orderBy: { paymentDate: "desc" }
  });

  return { invoices, payments };
}

/**
 * Gets approvals requested from the client
 */
export async function getPortalApprovals(clientId: string) {
  await validateClient(clientId);
  
  // We need to fetch Quotations that are pending client approval
  const pendingQuotations = await prisma.quotation.findMany({
    where: { clientId, status: 'DRAFT' }, // Assuming DRAFT or SENT is pending client approval
  });
  
  // Create mock approvals based on quotations for now to keep the portal UI working
  // without altering the underlying Approval state machine which is for Founders
  const approvals = pendingQuotations.map(q => ({
    id: q.id,
    type: 'QUOTATION',
    title: `Quotation ${q.quotationNumber}`,
    description: 'Please review and approve the quotation.',
    amount: Number(q.total),
    status: 'PENDING_REVIEW',
    version: 1
  }));
  
  return approvals;
}

export async function approveClientRequest(approvalId: string, notes?: string) {
  // Try to find if it's a quotation
  const quotation = await prisma.quotation.findUnique({ where: { id: approvalId } });
  
  if (quotation) {
    await prisma.quotation.update({
      where: { id: approvalId },
      data: { status: 'ACCEPTED' }
    });
    return { success: true };
  }
  
  throw new Error('Approval item not found');
}
