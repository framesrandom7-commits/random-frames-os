import { prisma } from "@/lib/prisma";

export class RevenueAnalyticsService {
  /**
   * Get total revenue, expenses, and profit for a given date range
   */
  public static async getFinancialOverview(startDate?: Date, endDate?: Date) {
    const invoiceWhere = {
      status: { notIn: ["CANCELLED", "DRAFT"] as any },
      ...(startDate || endDate ? {
        createdAt: {
          ...(startDate ? { gte: startDate } : {}),
          ...(endDate ? { lte: endDate } : {}),
        }
      } : {})
    };

    const expenseWhere = {
      ...(startDate || endDate ? {
        date: {
          ...(startDate ? { gte: startDate } : {}),
          ...(endDate ? { lte: endDate } : {}),
        }
      } : {})
    };

    const paymentWhere = {
      ...(startDate || endDate ? {
        paymentDate: {
          ...(startDate ? { gte: startDate } : {}),
          ...(endDate ? { lte: endDate } : {}),
        }
      } : {})
    };

    const [invoices, expenses, payments] = await Promise.all([
      prisma.invoice.aggregate({
        _sum: { total: true },
        where: invoiceWhere
      }),
      prisma.expense.aggregate({
        _sum: { amount: true },
        where: expenseWhere
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: paymentWhere
      })
    ]);

    const totalRevenue = Number(invoices._sum.total || 0);
    const totalExpenses = Number(expenses._sum.amount || 0);
    const totalCollected = Number(payments._sum.amount || 0);
    const profit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
    const outstanding = totalRevenue - totalCollected;

    return {
      totalRevenue,
      totalExpenses,
      totalCollected,
      outstandingPayments: outstanding > 0 ? outstanding : 0,
      profit,
      profitMargin: Number(profitMargin.toFixed(1))
    };
  }

  /**
   * Get revenue grouped by month for trends
   */
  public static async getRevenueTrends(year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const invoices = await prisma.invoice.findMany({
      where: {
        status: { notIn: ["CANCELLED", "DRAFT"] as any },
        createdAt: { gte: startDate, lte: endDate }
      },
      select: { total: true, createdAt: true }
    });

    const expenses = await prisma.expense.findMany({
      where: {
        date: { gte: startDate, lte: endDate }
      },
      select: { amount: true, date: true }
    });

    // Group by month
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(year, i, 1).toLocaleString('default', { month: 'short' }),
      revenue: 0,
      expenses: 0,
      profit: 0
    }));

    invoices.forEach(inv => {
      const monthIndex = inv.createdAt.getMonth();
      monthlyData[monthIndex].revenue += Number(inv.total || 0);
    });

    expenses.forEach(exp => {
      const monthIndex = exp.date.getMonth();
      monthlyData[monthIndex].expenses += Number(exp.amount || 0);
    });

    monthlyData.forEach(m => {
      m.profit = m.revenue - m.expenses;
    });

    return monthlyData;
  }
}
