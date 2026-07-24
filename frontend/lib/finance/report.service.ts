import { prisma } from "@/lib/prisma";
import { FinancialReportType } from "@prisma/client";

/**
 * ReportService
 * 
 * Central engine for generating financial reports.
 * Does not live in UI components or route handlers.
 */
export class ReportService {
  
  /**
   * Generates a comprehensive Profit & Loss report for a given time period.
   */
  static async generatePnLReport(startDate: Date, endDate: Date) {
    // 1. Fetch all paid invoices in the period
    const invoices = await prisma.invoice.findMany({
      where: {
        status: "PAID",
        issueDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        payments: true
      }
    });

    // Calculate exact revenue collected in the period
    const payments = await prisma.payment.findMany({
      where: {
        paymentDate: {
          gte: startDate,
          lte: endDate
        }
      }
    });
    const totalRevenue = payments.reduce((acc, p) => acc + Number(p.amount), 0);

    // 2. Fetch all expenses in the period
    const expenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        category: true
      }
    });
    
    const totalExpenses = expenses.reduce((acc, e) => acc + Number(e.amount), 0);

    // 3. Categorize expenses
    const expensesByCategory: Record<string, number> = {};
    expenses.forEach(e => {
      const catName = e.category?.name || "Uncategorized";
      expensesByCategory[catName] = (expensesByCategory[catName] || 0) + Number(e.amount);
    });

    // 4. Calculate Net Profit
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      period: { start: startDate, end: endDate },
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      expensesByCategory,
      metadata: {
        invoiceCount: invoices.length,
        expenseCount: expenses.length
      }
    };
  }

  /**
   * Creates a persisted report snapshot in the database.
   */
  static async snapshotReport(title: string, type: FinancialReportType, startDate: Date, endDate: Date, userId?: string) {
    let data;
    
    switch (type) {
      case "PNL":
        data = await this.generatePnLReport(startDate, endDate);
        break;
      default:
        data = { error: "Report type not fully implemented in snapshot generator yet." };
    }

    const report = await prisma.financialReport.create({
      data: {
        title,
        type,
        periodStart: startDate,
        periodEnd: endDate,
        data: data as any,
        generatedBy: userId
      }
    });

    return report;
  }
}
