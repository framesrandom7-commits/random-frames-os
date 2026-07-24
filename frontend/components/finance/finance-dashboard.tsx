"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet, FileText, AlertCircle, Clock, Receipt } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Link from "next/link";
import { Prisma } from "@prisma/client";

interface FinanceStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyNetProfit: number;
  totalPendingAmount: number;
  pendingInvoicesCount: number;
  overdueInvoicesCount: number;
  chartData: any[];
  recentInvoices: (Omit<Prisma.InvoiceGetPayload<{ include: { client: { select: { businessName: true } } } }>, 'subtotal' | 'discount' | 'tax' | 'total'> & {
    subtotal: number;
    discount: number | null;
    tax: number | null;
    total: number;
  })[];
  recentQuotations: (Omit<Prisma.QuotationGetPayload<{ include: { client: { select: { businessName: true } } } }>, 'subtotal' | 'discount' | 'tax' | 'total'> & {
    subtotal: number;
    discount: number | null;
    tax: number | null;
    total: number;
  })[];
  recentExpenses: (Omit<Prisma.ExpenseGetPayload<{}>, 'amount'> & { amount: number })[];
}

export default function FinanceDashboard({ stats }: { stats: FinanceStats }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD', // You can make this dynamic if needed
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-zinc-500 mt-1">
              +{formatCurrency(stats.monthlyRevenue)} this month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-zinc-400">Net Profit</CardTitle>
            <Wallet className="h-4 w-4 text-[#C1121F]" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(stats.netProfit)}
            </div>
            <p className="text-xs text-zinc-500 mt-1 flex items-center">
              {stats.monthlyNetProfit >= 0 ? (
                <span className="text-emerald-500 flex items-center"><ArrowUpRight className="h-3 w-3 mr-1"/>{formatCurrency(stats.monthlyNetProfit)}</span>
              ) : (
                <span className="text-red-500 flex items-center"><ArrowDownRight className="h-3 w-3 mr-1"/>{formatCurrency(Math.abs(stats.monthlyNetProfit))}</span>
              )}
              <span className="ml-1">this month</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-zinc-400">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(stats.totalPendingAmount)}</div>
            <p className="text-xs text-zinc-500 mt-1">
              Across {stats.pendingInvoicesCount} invoices
            </p>
          </CardContent>
        </Card>

        <Card className={`bg-white/5 border-white/10 backdrop-blur-md ${stats.overdueInvoicesCount > 0 ? 'border-red-500/50 bg-red-950/10' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-zinc-400">Overdue Invoices</CardTitle>
            <AlertCircle className={`h-4 w-4 ${stats.overdueInvoicesCount > 0 ? 'text-red-500' : 'text-zinc-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.overdueInvoicesCount > 0 ? 'text-red-500' : 'text-white'}`}>
              {stats.overdueInvoicesCount}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {stats.overdueInvoicesCount > 0 ? 'Requires immediate action' : 'All good'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Chart */}
        <Card className="md:col-span-4 bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white text-base">Revenue vs Expenses (6 Months)</CardTitle>
          </CardHeader>
          <CardContent className="pl-0 pr-4 pb-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: any) => [formatCurrency(Number(value || 0)), '']}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="md:col-span-3 space-y-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader className="pb-3 flex flex-row justify-between items-center">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Recent Invoices
              </CardTitle>
              <Link href="/finance/invoices" className="text-xs text-[#C1121F] hover:text-white transition-colors">View All</Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.recentInvoices.length === 0 ? (
                <div className="text-sm text-zinc-500 italic text-center py-4">No recent invoices</div>
              ) : (
                stats.recentInvoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-black/20 hover:bg-black/40 transition-colors border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        inv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' :
                        inv.status === 'OVERDUE' ? 'bg-red-500/10 text-red-500' :
                        'bg-blue-500/10 text-blue-500'
                      }`}>
                        {inv.client?.businessName.charAt(0) || '?'}
                      </div>
                      <div>
                        <Link href={`/finance/invoices/${inv.id}`} className="text-sm font-medium text-white hover:text-[#C1121F] transition-colors line-clamp-1">
                          {inv.invoiceNumber} - {inv.client?.businessName || 'Unknown Client'}
                        </Link>
                        <p className="text-xs text-zinc-500">{new Date(inv.issueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">{formatCurrency(inv.total)}</div>
                      <div className={`text-[10px] uppercase font-bold tracking-wider ${
                        inv.status === 'PAID' ? 'text-emerald-500' :
                        inv.status === 'OVERDUE' ? 'text-red-500' :
                        'text-zinc-500'
                      }`}>{inv.status}</div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader className="pb-3 flex flex-row justify-between items-center">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-zinc-400" />
                Recent Quotations
              </CardTitle>
              <Link href="/finance/quotations" className="text-xs text-[#C1121F] hover:text-white transition-colors">View All</Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.recentQuotations.length === 0 ? (
                <div className="text-sm text-zinc-500 italic text-center py-4">No recent quotations</div>
              ) : (
                stats.recentQuotations.map((quo) => (
                  <div key={quo.id} className="flex items-center justify-between p-3 rounded-lg bg-black/20 hover:bg-black/40 transition-colors border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        quo.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500' :
                        quo.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' :
                        'bg-zinc-500/10 text-zinc-500'
                      }`}>
                        {quo.client?.businessName.charAt(0) || '?'}
                      </div>
                      <div>
                        <Link href={`/finance/quotations/${quo.id}`} className="text-sm font-medium text-white hover:text-[#C1121F] transition-colors line-clamp-1">
                          {quo.quotationNumber} - {quo.client?.businessName || 'Unknown Client'}
                        </Link>
                        <p className="text-xs text-zinc-500">{new Date(quo.issueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">{formatCurrency(quo.total)}</div>
                      <div className={`text-[10px] uppercase font-bold tracking-wider ${
                        quo.status === 'APPROVED' ? 'text-emerald-500' :
                        quo.status === 'REJECTED' ? 'text-red-500' :
                        'text-zinc-500'
                      }`}>{quo.status}</div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader className="pb-3 flex flex-row justify-between items-center">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Recent Expenses
              </CardTitle>
              <Link href="/finance/expenses" className="text-xs text-[#C1121F] hover:text-white transition-colors">View All</Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.recentExpenses.length === 0 ? (
                <div className="text-sm text-zinc-500 italic text-center py-4">No recent expenses</div>
              ) : (
                stats.recentExpenses.map(expense => (
                  <div key={expense.id} className="flex items-center justify-between p-2">
                    <div>
                      <div className="font-medium text-white text-sm">{expense.title}</div>
                      <div className="text-[10px] text-zinc-500 uppercase">{expense.category.replace("_", " ")}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-red-400 text-sm">-{formatCurrency(Number(expense.amount))}</div>
                      <div className="text-xs text-zinc-500">{new Date(expense.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
