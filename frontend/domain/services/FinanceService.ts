import { FinanceRepository } from "../repositories/FinanceRepository";
import { NumberGenerator } from "@/lib/finance/number-generator.service";
import { EventBus } from "../events/EventBus";
import { WorkflowEvent } from "@/lib/workflow/events";
import { CreateInvoiceData, UpdateInvoiceData } from "@/app/actions/invoice";
import { CreatePaymentData } from "@/app/actions/payment";
import { CreateExpenseData } from "@/app/actions/expense";
import { ProjectService } from "./ProjectService";
import { prisma } from "@/lib/prisma";

export class FinanceService {
  static async getDashboardStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [
      invoicesThisMonth,
      totalPayments,
      totalExpenses,
      overdueInvoices
    ] = await Promise.all([
      FinanceRepository.aggregateInvoices({
        where: { issueDate: { gte: startOfMonth, lte: endOfMonth }, status: { not: "CANCELLED" } },
        _sum: { total: true }
      }),
      FinanceRepository.aggregatePayments({
        where: { paymentDate: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { amount: true }
      }),
      FinanceRepository.aggregateExpenses({
        where: { date: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { amount: true }
      }),
      FinanceRepository.aggregateInvoices({
        where: { status: "OVERDUE" },
        _sum: { total: true }
      })
    ]);

    const revenue = Number(totalPayments._sum?.amount || 0);
    const expenses = Number(totalExpenses._sum?.amount || 0);
    const profit = revenue - expenses;

    return {
      monthlyRevenue: revenue,
      monthlyExpenses: expenses,
      monthlyProfit: profit,
      invoicedThisMonth: Number(invoicesThisMonth._sum?.total || 0),
      overdueAmount: Number(overdueInvoices._sum?.total || 0)
    };
  }

  // Invoice Logic
  static async generateInvoiceNumber(): Promise<string> {
    return NumberGenerator.generateInvoiceNumber();
  }

  static async createInvoice(data: CreateInvoiceData) {
    const invoiceNum = data.invoiceNumber || await FinanceService.generateInvoiceNumber();
    
    // Capture snapshots for Document Engine
    let deliverablesSnapshot = [];
    if (data.projectId) {
      const { ProjectService } = await import("./ProjectService");
      const proj = await ProjectService.getProject(data.projectId);
      if (proj && proj.deliverables) {
        deliverablesSnapshot = proj.deliverables as any;
      }
    }

    const { getSettings } = await import("@/app/actions/settings");
    const rawSettings = await getSettings();
    const paymentSnapshot = {
      acceptUpi: rawSettings.acceptUpi !== false,
      upiId: rawSettings.PAYMENT_UPI_ID || "randomframes@upi",
      acceptBankTransfer: rawSettings.acceptBankTransfer !== false,
      bankName: rawSettings.PAYMENT_BANK_NAME || "State Bank of India",
      accountHolder: rawSettings.PAYMENT_BANK_HOLDER || "Random Frames",
      accountNumber: rawSettings.PAYMENT_BANK_ACCOUNT || "123456789012",
      ifscCode: rawSettings.PAYMENT_BANK_IFSC || "SBIN0001234",
    };
    
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: invoiceNum,
        issueDate: data.issueDate,
        dueDate: data.dueDate,
        subtotal: data.subtotal,
        discount: data.discount || 0,
        tax: data.tax || 0,
        total: data.total,
        status: data.status || "DRAFT",
        notes: data.notes,
        projectId: data.projectId,
        clientId: data.clientId,
        items: data.items ? {
          create: data.items,
        } : undefined,
        deliverables: deliverablesSnapshot,
        paymentSnapshot: paymentSnapshot,
      },
      include: {
        items: true
      }
    });

    if (data.projectId) {
      await ProjectService.syncFinancials(data.projectId);
    }
    
    EventBus.emit(WorkflowEvent.INVOICE_CREATED, {
      invoiceId: invoice.id,
      projectId: data.projectId,
      clientId: data.clientId,
    });
    
    return invoice;
  }

  static async updateInvoice(id: string, data: UpdateInvoiceData) {
    const existingInvoice = await FinanceRepository.findInvoiceById(id);
    if (!existingInvoice) throw new Error("Invoice not found");
    
    if (data.items) {
      await prisma.invoiceItem.deleteMany({
        where: { invoiceId: id }
      });
    }

    const updateData: any = {
      invoiceNumber: data.invoiceNumber,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      subtotal: data.subtotal,
      discount: data.discount,
      tax: data.tax,
      total: data.total,
      status: data.status,
      notes: data.notes,
      project: data.projectId ? { connect: { id: data.projectId } } : undefined,
      client: data.clientId ? { connect: { id: data.clientId } } : undefined,
    };

    if (data.items) {
      updateData.items = {
        create: data.items
      };
    }

    const invoice = await FinanceRepository.updateInvoice(id, updateData);

    if (existingInvoice.projectId && existingInvoice.projectId !== data.projectId) {
      await ProjectService.syncFinancials(existingInvoice.projectId);
    }
    if (invoice.projectId) {
      await ProjectService.syncFinancials(invoice.projectId);
    }

    if (existingInvoice.status !== 'SENT' && invoice.status === 'SENT') {
      EventBus.emit(WorkflowEvent.INVOICE_SENT, {
        invoiceId: invoice.id,
        projectId: invoice.projectId,
        clientId: invoice.clientId,
      });
    }
    
    return invoice;
  }

  static async deleteInvoice(id: string) {
    const invoice = await FinanceRepository.deleteInvoice(id);

    if (invoice.projectId) {
      await ProjectService.syncFinancials(invoice.projectId);
    }

    EventBus.emit(WorkflowEvent.TASK_COMPLETED, {
      taskId: "invoice_deleted",
      userId: invoice.clientId
    });

    return invoice;
  }

  static async getInvoices(params: any = {}) {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.clientId) where.clientId = params.clientId;
    if (params.projectId) where.projectId = params.projectId;
    if (params.status) where.status = params.status;

    const [invoices, total] = await Promise.all([
      FinanceRepository.findInvoices(where, skip, limit),
      FinanceRepository.countInvoices(where)
    ]);

    return { invoices, total, totalPages: Math.ceil(total / limit), page, limit };
  }

  static async getInvoice(id: string) {
    return FinanceRepository.findInvoiceById(id);
  }

  static async updateOverdueInvoices() {
    return FinanceRepository.updateOverdueInvoices(new Date());
  }

  // Payment Logic
  static async createPayment(data: CreatePaymentData) {
    const receiptNumber = await NumberGenerator.generateReceiptNumber();
    
    const payment = await FinanceRepository.createPayment({
      amount: data.amount,
      paymentDate: data.paymentDate,
      paymentMethod: data.paymentMethod,
      receiptNumber: receiptNumber,
      referenceNumber: data.referenceNumber || NumberGenerator.generatePaymentReference(),
      upiTransactionId: data.upiTransactionId,
      bankReference: data.bankReference,
      paymentScreenshotUrl: data.paymentScreenshotUrl,
      notes: data.notes,
      invoiceId: data.invoiceId,
      projectId: data.projectId,
      clientId: data.clientId,
    });

    if (data.projectId) {
      await ProjectService.syncFinancials(data.projectId);
    }
    
    EventBus.emit(WorkflowEvent.PAYMENT_RECEIVED, {
      paymentId: payment.id,
      invoiceId: data.invoiceId || undefined,
      amount: data.amount,
      projectId: data.projectId,
      clientId: data.clientId,
    });
    
    return payment;
  }

  static async deletePayment(id: string) {
    const payment = await FinanceRepository.deletePayment(id);
    if (payment.projectId) {
      await ProjectService.syncFinancials(payment.projectId);
    }
    EventBus.emit(WorkflowEvent.TASK_COMPLETED, {
      taskId: "payment_deleted", 
      userId: payment.clientId
    });
    return payment;
  }

  static async getPayments(params: any = {}) {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.clientId) where.clientId = params.clientId;
    if (params.projectId) where.projectId = params.projectId;
    if (params.invoiceId) where.invoiceId = params.invoiceId;

    const [payments, total] = await Promise.all([
      FinanceRepository.findPayments(where, skip, limit),
      FinanceRepository.countPayments(where)
    ]);

    return { payments, total, totalPages: Math.ceil(total / limit), page, limit };
  }

  // Expense Logic
  static async createExpense(data: CreateExpenseData) {
    const expense = await FinanceRepository.createExpense({
      title: data.title,
      categoryId: data.categoryId,
      amount: data.amount,
      date: data.date,
      paymentMethod: data.paymentMethod,
      clientId: data.clientId,
      projectId: data.projectId,
      vendor: data.vendor,
      receiptUrl: data.receiptUrl,
      notes: data.notes,
    });

    if (data.projectId) {
      await ProjectService.syncFinancials(data.projectId);
    }

    const { logActivity } = await import('@/lib/timeline');
    await logActivity({
      type: "SYSTEM",
      description: `Expense added: ${data.title} (${data.amount})`,
      expenseId: expense.id,
      projectId: data.projectId,
      clientId: data.clientId,
    });

    return expense;
  }

  static async deleteExpense(id: string) {
    const expense = await FinanceRepository.deleteExpense(id);

    if (expense.projectId) {
      await ProjectService.syncFinancials(expense.projectId);
    }

    const { logActivity } = await import('@/lib/timeline');
    await logActivity({
      type: "SYSTEM",
      description: `Expense deleted: ${expense.title}`,
      projectId: expense.projectId || undefined,
      clientId: expense.clientId || undefined,
    });

    return expense;
  }

  static async getExpenses(params: any = {}) {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }
    
    if (params.month && params.year) {
      const startDate = new Date(params.year, params.month - 1, 1);
      const endDate = new Date(params.year, params.month, 0, 23, 59, 59, 999);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const [expenses, total] = await Promise.all([
      FinanceRepository.findExpenses(where, skip, limit),
      FinanceRepository.countExpenses(where)
    ]);

    return { expenses, total, totalPages: Math.ceil(total / limit), page, limit };
  }

  // Quotation Logic
  static async createQuotation(data: any) {
    // Capture deliverables snapshot
    let deliverablesSnapshot = [];
    if (data.projectId) {
      const { ProjectService } = await import("./ProjectService");
      const proj = await ProjectService.getProject(data.projectId);
      if (proj && proj.deliverables) {
        deliverablesSnapshot = proj.deliverables as any;
      }
    }

    const quotation = await FinanceRepository.createQuotation({
      data: {
        quotationNumber: data.quotationNumber,
        issueDate: data.issueDate,
        validUntil: data.validUntil,
        subtotal: data.subtotal,
        discount: data.discount || 0,
        tax: data.tax || 0,
        total: data.total,
        status: data.status || "DRAFT",
        notes: data.notes,
        termsAndConditions: data.termsAndConditions,
        clientId: data.clientId,
        projectId: data.projectId || null,
        items: {
          create: data.items,
        },
        deliverables: deliverablesSnapshot,
      }
    });

    EventBus.emit(WorkflowEvent.QUOTATION_CREATED, {
      quotationId: quotation.id,
      projectId: data.projectId,
      clientId: data.clientId,
    });
    
    return quotation;
  }

  static async updateQuotation(id: string, data: any) {
    const existingQuotation = await FinanceRepository.findQuotationById(id);
    if (!existingQuotation) throw new Error("Quotation not found");

    if (data.items) {
      await prisma.quotationItem.deleteMany({
        where: { quotationId: id }
      });
    }

    const updateData: any = {
      quotationNumber: data.quotationNumber,
      issueDate: data.issueDate,
      validUntil: data.validUntil,
      subtotal: data.subtotal,
      discount: data.discount,
      tax: data.tax,
      total: data.total,
      status: data.status,
      notes: data.notes,
      termsAndConditions: data.termsAndConditions,
      project: data.projectId ? { connect: { id: data.projectId } } : undefined,
      client: data.clientId ? { connect: { id: data.clientId } } : undefined,
    };

    if (data.items) {
      updateData.items = {
        create: data.items
      };
    }

    const quotation = await FinanceRepository.updateQuotation(id, updateData);

    if (existingQuotation.status !== 'APPROVED' && quotation.status === 'APPROVED') {
      EventBus.emit(WorkflowEvent.QUOTATION_APPROVED, {
        quotationId: quotation.id,
        projectId: quotation.projectId,
        clientId: quotation.clientId,
      });
    } else if (existingQuotation.status !== 'REJECTED' && quotation.status === 'REJECTED') {
      EventBus.emit(WorkflowEvent.QUOTATION_REJECTED, {
        quotationId: quotation.id,
        projectId: quotation.projectId,
        clientId: quotation.clientId,
      });
    }

    return quotation;
  }

  static async getQuotations(params: any = {}) {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.clientId) where.clientId = params.clientId;
    if (params.projectId) where.projectId = params.projectId;
    if (params.status) where.status = params.status;

    const [quotations, total] = await Promise.all([
      FinanceRepository.findQuotations(where, skip, limit),
      FinanceRepository.countQuotations(where)
    ]);

    return { quotations, total, totalPages: Math.ceil(total / limit), page, limit };
  }

  static async getQuotation(id: string) {
    return FinanceRepository.findQuotationById(id);
  }
}
