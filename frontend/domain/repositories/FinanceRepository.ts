import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export class FinanceRepository {
  static async countInvoices(where?: Prisma.InvoiceWhereInput) {
    return prisma.invoice.count({ where });
  }

  static async findInvoices(where: Prisma.InvoiceWhereInput, skip?: number, take?: number, orderBy?: any) {
    return prisma.invoice.findMany({
      where,
      skip,
      take,
      orderBy: orderBy || { issueDate: "desc" },
      include: {
        client: true,
        project: true,
        items: true,
        payments: true
      }
    });
  }

  static async findInvoiceById(id: string) {
    return prisma.invoice.findUnique({
      where: { id },
      include: {
        client: true,
        project: true,
        items: true,
        payments: true
      }
    });
  }

  static async createInvoice(data: any) {
    return prisma.invoice.create({ data });
  }

  static async updateInvoice(id: string, data: any) {
    return prisma.invoice.update({
      where: { id },
      data
    });
  }

  static async deleteInvoice(id: string) {
    return prisma.invoice.delete({
      where: { id }
    });
  }

  static async aggregateInvoices(args: Prisma.InvoiceAggregateArgs) {
    return prisma.invoice.aggregate(args);
  }

  static async aggregatePayments(args: Prisma.PaymentAggregateArgs) {
    return prisma.payment.aggregate(args);
  }

  static async aggregateExpenses(args: Prisma.ExpenseAggregateArgs) {
    return prisma.expense.aggregate(args);
  }

  // Payments
  static async createPayment(data: any) {
    return prisma.payment.create({ data });
  }

  static async deletePayment(id: string) {
    return prisma.payment.delete({ where: { id } });
  }

  static async findPayments(where: Prisma.PaymentWhereInput, skip?: number, take?: number, orderBy?: any) {
    return prisma.payment.findMany({
      where,
      skip,
      take,
      orderBy: orderBy || { paymentDate: "desc" },
      include: {
        client: true,
        project: true,
        invoice: true
      }
    });
  }

  static async countPayments(where?: Prisma.PaymentWhereInput) {
    return prisma.payment.count({ where });
  }

  // Expenses
  static async createExpense(data: any) {
    return prisma.expense.create({ data });
  }

  static async deleteExpense(id: string) {
    return prisma.expense.delete({ where: { id } });
  }

  static async findExpenses(where: Prisma.ExpenseWhereInput, skip?: number, take?: number, orderBy?: any) {
    return prisma.expense.findMany({
      where,
      skip,
      take,
      orderBy: orderBy || { date: "desc" },
      include: {
        client: true,
        project: true,
        category: true,
      }
    });
  }

  static async countExpenses(where?: Prisma.ExpenseWhereInput) {
    return prisma.expense.count({ where });
  }

  static async updateOverdueInvoices(now: Date) {
    return prisma.invoice.updateMany({
      where: {
        dueDate: { lt: now },
        status: { in: ["DRAFT", "SENT", "PARTIAL"] }
      },
      data: {
        status: "OVERDUE"
      }
    });
  }

  // Quotations
  static async createQuotation(data: any) {
    return prisma.quotation.create({ data });
  }

  static async updateQuotation(id: string, data: any) {
    return prisma.quotation.update({ where: { id }, data });
  }

  static async findQuotationById(id: string) {
    return prisma.quotation.findUnique({
      where: { id },
      include: {
        client: true,
        project: true,
        items: true,
      },
    });
  }

  static async findQuotations(where: Prisma.QuotationWhereInput, skip?: number, take?: number, orderBy?: any) {
    return prisma.quotation.findMany({
      where,
      skip,
      take,
      orderBy: orderBy || { issueDate: "desc" },
      include: {
        client: true,
        project: true,
      },
    });
  }

  static async countQuotations(where?: Prisma.QuotationWhereInput) {
    return prisma.quotation.count({ where });
  }
}
