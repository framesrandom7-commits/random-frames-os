import { ReportsRepository } from "../repositories/ReportsRepository";
import { LEAD_FUNNEL_ORDER } from "../workflow/core";

export class ReportsService {
  static async getDashboardData(range?: any) {
    let dateFilter: any = undefined;
    if (range?.startDate || range?.endDate) {
      dateFilter = {};
      if (range.startDate) dateFilter.gte = range.startDate;
      if (range.endDate) dateFilter.lte = range.endDate;
    }
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
    ] = await ReportsRepository.getDashboardMetrics(createdAtFilter, dateFilter);

    // Metrics processing
    const totalLeads = leadsByStatus.reduce((sum, item) => sum + item._count, 0);
    const wonLeads = leadsByStatus.find(l => l.status === "CONVERTED")?._count || 0;
    const lostLeads = leadsByStatus.find(l => l.status === "LOST")?._count || 0;
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
    const sourceDistribution = leadsBySource.map(l => ({ name: l.leadSource.replace(/_/g, " "), value: l._count }));
    const projectDistribution = projectsByStatus.map(p => ({ name: p.status.replace(/_/g, " "), value: p._count }));
    const paymentDistribution = projectsByPayment.map(p => ({ name: p.paymentStatus, value: p._count }));

    const funnelData = leadsByStatus
      .sort((a, b) => {
        const idxA = LEAD_FUNNEL_ORDER.indexOf(a.status);
        const idxB = LEAD_FUNNEL_ORDER.indexOf(b.status);
        return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
      })
      .map(s => ({
        stage: s.status.replace(/_/g, " "),
        count: s._count
      }));

    // Generate last 6 months for trend chart
    const revenueTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthYear = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthName = d.toLocaleString('default', { month: 'short' });
      
      revenueTrend.push({
        month: monthName,
        revenue: monthlyData[monthYear]?.revenue || 0,
        expenses: monthlyData[monthYear]?.expenses || 0,
      });
    }

    return {
      metrics: {
        totalLeads,
        wonLeads,
        lostLeads,
        conversionRate,
        totalProjects,
        completedProjects,
        totalClients,
        totalShoots,
        contentPlans,
        financials: {
          totalRevenue,
          totalExpenses,
          netProfit,
          outstandingPayments
        }
      },
      charts: {
        sourceDistribution,
        projectDistribution,
        paymentDistribution,
        funnelData,
        revenueTrend
      },
      team: {
        users: users.map(u => ({
          name: u.name,
          role: u.role,
          projectsCount: u.assignedProjects.length
        }))
      }
    };
  }

  static async getFinancialReport(year: number, month?: number) {
    const startDate = month ? new Date(year, month - 1, 1) : new Date(year, 0, 1);
    const endDate = month ? new Date(year, month, 0, 23, 59, 59, 999) : new Date(year, 11, 31, 23, 59, 59, 999);

    const [invoices, expenses] = await ReportsRepository.getFinancialData(startDate, endDate);

    let totalInvoiced = 0;
    let totalCollected = 0;
    let totalExpenses = 0;
    const categoryExpenses: Record<string, number> = {};
    const monthlyData: Record<string, { invoiced: number, collected: number, expenses: number }> = {};

    invoices.forEach(inv => {
      totalInvoiced += Number(inv.total);
      
      const monthKey = inv.issueDate.toLocaleString('default', { month: 'short' });
      if (!monthlyData[monthKey]) monthlyData[monthKey] = { invoiced: 0, collected: 0, expenses: 0 };
      monthlyData[monthKey].invoiced += Number(inv.total);

      inv.payments.forEach(p => {
        totalCollected += Number(p.amount);
        const pMonthKey = p.paymentDate.toLocaleString('default', { month: 'short' });
        if (!monthlyData[pMonthKey]) monthlyData[pMonthKey] = { invoiced: 0, collected: 0, expenses: 0 };
        monthlyData[pMonthKey].collected += Number(p.amount);
      });
    });

    expenses.forEach(exp => {
      totalExpenses += Number(exp.amount);
      
      // We don't have category string easily accessible here without include, assume we group by some ID or name if added later
      const catKey = exp.categoryId || "Uncategorized";
      categoryExpenses[catKey] = (categoryExpenses[catKey] || 0) + Number(exp.amount);

      const monthKey = exp.date.toLocaleString('default', { month: 'short' });
      if (!monthlyData[monthKey]) monthlyData[monthKey] = { invoiced: 0, collected: 0, expenses: 0 };
      monthlyData[monthKey].expenses += Number(exp.amount);
    });

    return {
      summary: {
        totalInvoiced,
        totalCollected,
        totalExpenses,
        netProfit: totalCollected - totalExpenses,
        outstanding: totalInvoiced - totalCollected
      },
      categoryExpenses: Object.entries(categoryExpenses).map(([name, amount]) => ({ name, amount })),
      monthlyTrend: Object.entries(monthlyData).map(([month, data]) => ({ month, ...data }))
    };
  }
}
