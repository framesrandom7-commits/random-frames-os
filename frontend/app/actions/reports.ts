"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type DateRangeFilter = {
  startDate?: Date;
  endDate?: Date;
};

function getDateFilter(range?: DateRangeFilter) {
  if (!range?.startDate && !range?.endDate) return undefined;
  const filter: { gte?: Date; lte?: Date } = {};
  if (range.startDate) filter.gte = range.startDate;
  if (range.endDate) filter.lte = range.endDate;
  return filter;
}

export async function getDashboardData(range?: DateRangeFilter) {
  const dateFilter = getDateFilter(range);
  const createdAtFilter = dateFilter ? { createdAt: dateFilter } : undefined;

  const [
    leadsByStatus,
    projectsByStatus,
    totalClients,
    totalShoots,
    leadsBySource,
    projectsByPayment,
    invoices,
    expenses
  ] = await Promise.all([
    prisma.lead.groupBy({ by: ['status'], where: createdAtFilter, _count: true }),
    prisma.project.groupBy({ by: ['status'], where: createdAtFilter, _count: true }),
    prisma.client.count({ where: createdAtFilter }),
    prisma.shoot.count({ where: dateFilter ? { date: dateFilter } : undefined }),
    prisma.lead.groupBy({ by: ['leadSource'], where: createdAtFilter, _count: true }),
    prisma.project.groupBy({ by: ['paymentStatus'], where: createdAtFilter, _count: true }),
    prisma.invoice.findMany({ where: dateFilter ? { issueDate: dateFilter } : undefined, select: { total: true, status: true, issueDate: true, payments: { select: { amount: true, paymentDate: true } } } }),
    prisma.expense.findMany({ where: dateFilter ? { date: dateFilter } : undefined, select: { amount: true, date: true } })
  ]);

  // Metrics processing
  const totalLeads = leadsByStatus.reduce((sum, item) => sum + item._count, 0);
  const wonLeads = leadsByStatus.find(l => l.status === "CONVERTED_TO_CLIENT")?._count || 0;
  const lostLeads = leadsByStatus.find(l => l.status === "CLOSED_LOST")?._count || 0;
  const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;

  const totalProjects = projectsByStatus.reduce((sum, item) => sum + item._count, 0);
  const completedProjects = projectsByStatus.filter(p => p.status === "COMPLETED" || p.status === "DELIVERED").reduce((sum, p) => sum + p._count, 0);

  let totalRevenue = 0;
  let outstandingPayments = 0;
  
  const monthlyData: Record<string, { revenue: number; expenses: number }> = {};

  invoices.forEach(inv => {
    const paidAmount = inv.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    totalRevenue += paidAmount;
    
    if (inv.status !== "PAID" && inv.status !== "CANCELLED") {
      outstandingPayments += (Number(inv.total) - paidAmount);
    }

    inv.payments.forEach(p => {
      const monthYear = `${p.paymentDate.getFullYear()}-${String(p.paymentDate.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[monthYear]) monthlyData[monthYear] = { revenue: 0, expenses: 0 };
      monthlyData[monthYear].revenue += Number(p.amount);
    });
  });

  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const netProfit = totalRevenue - totalExpenses;

  expenses.forEach(exp => {
    const monthYear = `${exp.date.getFullYear()}-${String(exp.date.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyData[monthYear]) monthlyData[monthYear] = { revenue: 0, expenses: 0 };
    monthlyData[monthYear].expenses += Number(exp.amount);
  });

  // Chart data processing
  const sourceDistribution = leadsBySource.map(l => ({ name: l.leadSource.replace("_", " "), value: l._count }));
  const projectDistribution = projectsByStatus.map(p => ({ name: p.status.replace("_", " "), value: p._count }));
  const paymentDistribution = projectsByPayment.map(p => ({ name: p.paymentStatus, value: p._count }));

  const funnelOrder = [
    "NEW", 
    "ATTENDED", 
    "REQUIREMENT_DISCUSSION", 
    "QUOTATION_SENT", 
    "NEGOTIATION", 
    "QUOTATION_ACCEPTED", 
    "CLIENT_FORM_SENT", 
    "CLIENT_FORM_RECEIVED", 
    "CONVERTED_TO_CLIENT", 
    "CLOSED_LOST"
  ];
  const leadFunnel = funnelOrder.map(status => {
    const found = leadsByStatus.find(l => l.status === status);
    return { name: status.replace(/_/g, " "), value: found ? found._count : 0 };
  }).filter(f => f.value > 0 || f.name === "NEW" || f.name === "CONVERTED TO CLIENT");

  const revenueTrend = Object.keys(monthlyData).sort().map(key => {
    const [year, month] = key.split('-');
    const monthName = new Date(Number(year), Number(month) - 1, 1).toLocaleString('default', { month: 'short' });
    return {
      month: `${monthName} ${year.slice(2)}`,
      sortKey: key,
      revenue: monthlyData[key].revenue,
      expenses: monthlyData[key].expenses,
      profit: monthlyData[key].revenue - monthlyData[key].expenses
    };
  });

  return {
    metrics: {
      totalLeads, wonLeads, lostLeads, conversionRate,
      totalClients, totalProjects, completedProjects, totalShoots,
      totalRevenue, totalExpenses, netProfit, outstandingPayments
    },
    chartData: {
      sourceDistribution, leadFunnel, projectDistribution, paymentDistribution, revenueTrend
    }
  };
}

export async function getTopLists(range?: DateRangeFilter) {
  const dateFilter = getDateFilter(range);
  const createdAtFilter = dateFilter ? { createdAt: dateFilter } : undefined;

  // Top Clients (by total revenue via projects)
  const projects = await prisma.project.findMany({
    where: createdAtFilter,
    include: { client: true }
  });

  const clientRevenue: Record<string, { id: string, name: string, total: number }> = {};
  projects.forEach(p => {
    if (!clientRevenue[p.clientId]) {
      clientRevenue[p.clientId] = { id: p.clientId, name: p.client.businessName, total: 0 };
    }
    clientRevenue[p.clientId].total += Number(p.totalAmount || 0);
  });
  
  const topClients = Object.values(clientRevenue)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Most Profitable Projects
  const topProjects = projects
    .filter(p => Number(p.totalAmount || 0) > 0)
    .sort((a, b) => Number(b.totalAmount || 0) - Number(a.totalAmount || 0))
    .slice(0, 5)
    .map(p => ({
      id: p.id,
      title: p.title,
      clientName: p.client.businessName,
      amount: Number(p.totalAmount || 0)
    }));

  // Upcoming Deliveries
  const upcomingDeliveries = await prisma.project.findMany({
    where: {
      deliveryDate: { gte: new Date() },
      status: { notIn: ["COMPLETED", "DELIVERED", "CANCELLED"] }
    },
    orderBy: { deliveryDate: 'asc' },
    take: 5,
    include: { client: true }
  });

  // Overdue Payments (Invoices)
  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      OR: [
        { status: "OVERDUE" },
        { status: { notIn: ["PAID", "CANCELLED"] }, dueDate: { lt: new Date() } }
      ]
    },
    orderBy: { dueDate: 'asc' },
    take: 5,
    include: { client: true, project: true, payments: true }
  });

  const overdueMapped = overdueInvoices.map(inv => {
    const paid = inv.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    return {
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      clientName: inv.client.businessName,
      dueDate: inv.dueDate,
      balance: Number(inv.total) - paid
    };
  });

  return {
    topClients,
    topProjects,
    upcomingDeliveries,
    overdueInvoices: overdueMapped
  };
}

import { ReportService } from "@/lib/finance/report.service";

export async function generatePnLReportAction(startDate: Date, endDate: Date) {
  try {
    return await ReportService.generatePnLReport(startDate, endDate);
  } catch (error) {
    console.error("Error generating PnL:", error);
    throw new Error("Failed to generate PnL report");
  }
}

export async function getFinancialReports() {
  try {
    return await prisma.financialReport.findMany({
      orderBy: { createdAt: "desc" },
      take: 10
    });
  } catch (error) {
    console.error("Error fetching financial reports:", error);
    return [];
  }
}
