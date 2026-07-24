"use server";

import { prisma } from "@/lib/prisma";
import { FinanceService } from "@/lib/finance/finance.service";

export async function getFinanceDashboardStats() {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const startOfNextMonth = new Date(currentYear, currentMonth + 1, 1);

    // Get all payments total (Total Revenue)
    const allPayments = await prisma.payment.aggregate({
      _sum: { amount: true }
    });
    
    // Get all expenses total (Total Expenses)
    const allExpenses = await prisma.expense.aggregate({
      _sum: { amount: true }
    });
    
    // Get revenue this month (Payments received this month)
    const monthlyPayments = await prisma.payment.aggregate({
      where: {
        paymentDate: {
          gte: startOfMonth,
          lt: startOfNextMonth
        }
      },
      _sum: { amount: true }
    });
    
    // Get expenses this month
    const monthlyExpenses = await prisma.expense.aggregate({
      where: {
        date: {
          gte: startOfMonth,
          lt: startOfNextMonth
        }
      },
      _sum: { amount: true }
    });
    
    // Get pending invoices count & amount
    const pendingInvoices = await prisma.invoice.findMany({
      where: { status: { in: ["SENT", "PARTIAL", "OVERDUE"] } },
      include: { payments: true }
    });
    
    let totalPendingAmount = 0;
    pendingInvoices.forEach(inv => {
      totalPendingAmount += FinanceService.calculateInvoiceBalance(inv.total, inv.payments);
    });

    const overdueCount = pendingInvoices.filter(i => i.status === "OVERDUE").length;

    // Monthly Chart Data (Last 6 months)
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(currentYear, currentMonth - i, 1);
      const monthEnd = new Date(currentYear, currentMonth - i + 1, 0, 23, 59, 59, 999);
      
      const rev = await prisma.payment.aggregate({
        where: { paymentDate: { gte: monthStart, lte: monthEnd } },
        _sum: { amount: true }
      });
      
      const exp = await prisma.expense.aggregate({
        where: { date: { gte: monthStart, lte: monthEnd } },
        _sum: { amount: true }
      });
      
      const revTotal = Number(rev._sum.amount || 0);
      const expTotal = Number(exp._sum.amount || 0);
      
      chartData.push({
        name: monthStart.toLocaleString('default', { month: 'short' }),
        revenue: revTotal,
        expenses: expTotal,
        profit: FinanceService.calculateNetProfit(revTotal, [{ amount: expTotal }])
      });
    }

    const recentInvoices = await prisma.invoice.findMany({
      take: 5,
      orderBy: { issueDate: "desc" },
      include: { client: { select: { businessName: true } } }
    });
    
    const recentQuotations = await prisma.quotation.findMany({
      take: 5,
      orderBy: { issueDate: "desc" },
      include: { client: { select: { businessName: true } } }
    });
    
    const recentExpenses = await prisma.expense.findMany({
      take: 5,
      orderBy: { date: "desc" },
      include: { category: true }
    });

    const formattedRecentInvoices = recentInvoices.map(inv => ({
      ...inv,
      subtotal: Number(inv.subtotal),
      tax: inv.tax ? Number(inv.tax) : null,
      discount: inv.discount ? Number(inv.discount) : null,
      total: Number(inv.total)
    }));

    const formattedRecentQuotations = recentQuotations.map(quo => ({
      ...quo,
      subtotal: Number(quo.subtotal),
      tax: quo.tax ? Number(quo.tax) : null,
      discount: quo.discount ? Number(quo.discount) : null,
      total: Number(quo.total)
    }));

    const formattedRecentExpenses = recentExpenses.map(exp => ({
      ...exp,
      amount: Number(exp.amount)
    }));

    const totalRevenue = Number(allPayments._sum.amount || 0);
    const totalExp = Number(allExpenses._sum.amount || 0);
    const monthRev = Number(monthlyPayments._sum.amount || 0);
    const monthExp = Number(monthlyExpenses._sum.amount || 0);

    return {
      totalRevenue,
      totalExpenses: totalExp,
      netProfit: FinanceService.calculateNetProfit(totalRevenue, [{ amount: totalExp }]),
      monthlyRevenue: monthRev,
      monthlyExpenses: monthExp,
      monthlyNetProfit: FinanceService.calculateNetProfit(monthRev, [{ amount: monthExp }]),
      totalPendingAmount,
      pendingInvoicesCount: pendingInvoices.length,
      overdueInvoicesCount: overdueCount,
      chartData,
      recentInvoices: formattedRecentInvoices,
      recentQuotations: formattedRecentQuotations,
      recentExpenses: formattedRecentExpenses
    };
  } catch (error) {
    console.error("Error fetching finance stats:", error);
    return null;
  }
}

