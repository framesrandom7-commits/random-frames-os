"use server";

import { prisma } from "@/lib/prisma";

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
      const paid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
      totalPendingAmount += (Number(inv.total) - paid);
    });

    const overdueCount = pendingInvoices.filter(i => i.status === "OVERDUE").length;

    // Monthly Chart Data (Last 6 months)
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(currentYear, currentMonth - i, 1);
      const monthEnd = new Date(currentYear, currentMonth - i + 1, 0, 23, 59, 59);
      
      const rev = await prisma.payment.aggregate({
        where: { paymentDate: { gte: monthStart, lte: monthEnd } },
        _sum: { amount: true }
      });
      
      const exp = await prisma.expense.aggregate({
        where: { date: { gte: monthStart, lte: monthEnd } },
        _sum: { amount: true }
      });
      
      chartData.push({
        name: monthStart.toLocaleString('default', { month: 'short' }),
        revenue: Number(rev._sum.amount || 0),
        expenses: Number(exp._sum.amount || 0),
        profit: Number(rev._sum.amount || 0) - Number(exp._sum.amount || 0)
      });
    }

    const recentInvoices = await prisma.invoice.findMany({
      take: 5,
      orderBy: { issueDate: "desc" },
      include: { client: { select: { businessName: true } } }
    });
    
    const recentExpenses = await prisma.expense.findMany({
      take: 5,
      orderBy: { date: "desc" }
    });

    const formattedRecentInvoices = recentInvoices.map(inv => ({
      ...inv,
      subtotal: Number(inv.subtotal),
      tax: inv.tax ? Number(inv.tax) : null,
      discount: inv.discount ? Number(inv.discount) : null,
      total: Number(inv.total)
    }));

    const formattedRecentExpenses = recentExpenses.map(exp => ({
      ...exp,
      amount: Number(exp.amount)
    }));

    return {
      totalRevenue: Number(allPayments._sum.amount || 0),
      totalExpenses: Number(allExpenses._sum.amount || 0),
      netProfit: Number(allPayments._sum.amount || 0) - Number(allExpenses._sum.amount || 0),
      monthlyRevenue: Number(monthlyPayments._sum.amount || 0),
      monthlyExpenses: Number(monthlyExpenses._sum.amount || 0),
      monthlyNetProfit: Number(monthlyPayments._sum.amount || 0) - Number(monthlyExpenses._sum.amount || 0),
      totalPendingAmount,
      pendingInvoicesCount: pendingInvoices.length,
      overdueInvoicesCount: overdueCount,
      chartData,
      recentInvoices: formattedRecentInvoices,
      recentExpenses: formattedRecentExpenses
    };
  } catch (error) {
    console.error("Error fetching finance stats:", error);
    return null;
  }
}
