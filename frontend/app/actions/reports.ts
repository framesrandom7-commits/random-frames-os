"use server";

import { ReportsRepository } from "@/domain/repositories/ReportsRepository";
import { LEAD_FUNNEL_ORDER } from "@/domain/workflow/core";

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
    expenses,
    contentPlans,
    users
  ]: any[] = await ReportsRepository.getDashboardMetrics(createdAtFilter, dateFilter);

  // Metrics processing
  const totalLeads = leadsByStatus.reduce((sum: number, item: any) => sum + item._count, 0);
  const wonLeads = leadsByStatus.find((l: any) => l.status === "CONVERTED")?._count || 0;
  const lostLeads = leadsByStatus.find((l: any) => l.status === "LOST")?._count || 0;
  const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;

  const totalProjects = projectsByStatus.reduce((sum: number, item: any) => sum + item._count, 0);
  const completedProjects = projectsByStatus.filter((p: any) => p.status === "COMPLETED" || p.status === "DELIVERED").reduce((sum: any, p: any) => sum + p._count, 0);

  let totalRevenue = 0;
  let outstandingPayments = 0;
  
  const monthlyData: Record<string, { revenue: number; expenses: number }> = {};

  invoices.forEach((inv: any) => {
    const paidAmount = inv.payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
    totalRevenue += paidAmount;
    
    if (inv.status !== "PAID" && inv.status !== "CANCELLED") {
      outstandingPayments += (Number(inv.total) - paidAmount);
    }

    inv.payments.forEach((p: any) => {
      const monthYear = `${p.paymentDate.getFullYear()}-${String(p.paymentDate.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[monthYear]) monthlyData[monthYear] = { revenue: 0, expenses: 0 };
      monthlyData[monthYear].revenue += Number(p.amount);
    });
  });

  const totalExpenses = expenses.reduce((sum: number, exp: any) => sum + Number(exp.amount), 0);
  const netProfit = totalRevenue - totalExpenses;

  expenses.forEach((exp: any) => {
    const monthYear = `${exp.date.getFullYear()}-${String(exp.date.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyData[monthYear]) monthlyData[monthYear] = { revenue: 0, expenses: 0 };
    monthlyData[monthYear].expenses += Number(exp.amount);
  });

  // Chart data processing
  const sourceDistribution = leadsBySource.map((l: any) => ({ name: (l.leadSource || "WEBSITE").replace("_", " "), value: l._count }));
  const projectDistribution = projectsByStatus.map((p: any) => ({ name: (p.status || "IN_PROGRESS").replace("_", " "), value: p._count }));
  const paymentDistribution = projectsByPayment.map((p: any) => ({ name: p.paymentStatus || "PENDING", value: p._count }));

  const funnelOrder = LEAD_FUNNEL_ORDER;
  const leadFunnel = funnelOrder.map((status: string) => {
    const found = leadsByStatus.find((l: any) => l.status === status);
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

  const teamPerformance = (users || []).map((u: any) => {
    const active = u.assignedProjects?.filter((p: any) => p.status !== "COMPLETED" && p.status !== "DELIVERED" && p.status !== "CANCELLED").length || 0;
    const completed = u.assignedProjects?.filter((p: any) => p.status === "COMPLETED" || p.status === "DELIVERED").length || 0;
    return {
      name: u.name || u.email || "Unknown User",
      activeProjects: active,
      completedProjects: completed
    };
  });

  return {
    metrics: {
      totalLeads, wonLeads, lostLeads, conversionRate,
      totalClients, totalProjects, completedProjects, totalShoots,
      totalRevenue, totalExpenses, netProfit, outstandingPayments
    },
    chartData: {
      sourceDistribution, leadFunnel, projectDistribution, paymentDistribution, revenueTrend, teamPerformance
    }
  };
}

export async function getTopLists(range?: DateRangeFilter) {
  const dateFilter = getDateFilter(range);
  const createdAtFilter = dateFilter ? { createdAt: dateFilter } : undefined;

  const [projects, upcomingDeliveries, overdueInvoices]: any[] = await ReportsRepository.getTopListsData(createdAtFilter);

  const clientRevenue: Record<string, { id: string, name: string, total: number }> = {};
  projects.forEach((p: any) => {
    if (!clientRevenue[p.clientId]) {
      clientRevenue[p.clientId] = { id: p.clientId, name: p.client?.businessName || p.client?.name || "Client", total: 0 };
    }
    clientRevenue[p.clientId].total += Number(p.totalAmount || p.budget || 0);
  });
  
  const topClients = Object.values(clientRevenue)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const topProjects = projects
    .filter((p: any) => Number(p.totalAmount || p.budget || 0) > 0)
    .sort((a: any, b: any) => Number(b.totalAmount || b.budget || 0) - Number(a.totalAmount || a.budget || 0))
    .slice(0, 5)
    .map((p: any) => ({
      id: p.id,
      title: p.title,
      clientName: p.client?.businessName || p.client?.name || "Client",
      amount: Number(p.totalAmount || p.budget || 0)
    }));

  const overdueMapped = overdueInvoices.map((inv: any) => {
    const paid = (inv.payments || []).reduce((sum: number, p: any) => sum + Number(p.amount), 0);
    return {
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      clientName: inv.client?.businessName || inv.client?.name || "Client",
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
    return await ReportsRepository.getFinancialReports();
  } catch (error) {
    console.error("Error fetching financial reports:", error);
    return [];
  }
}
