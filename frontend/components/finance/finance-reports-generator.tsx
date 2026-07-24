"use client";

import React, { useState, useTransition } from "react";
import { generatePnLReportAction } from "@/app/actions/reports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, DollarSign, Wallet, TrendingUp, Download, PieChart as PieChartIcon } from "lucide-react";
import { CurrencyService } from "@/lib/finance/currency.service";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function FinanceReportsGenerator() {
  const [isPending, startTransition] = useTransition();
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
  );
  const [report, setReport] = useState<any>(null);

  const formatCurrency = (amount: number) => {
    return CurrencyService.format(amount);
  };

  const handleGenerate = () => {
    startTransition(async () => {
      try {
        const result = await generatePnLReportAction(new Date(startDate), new Date(endDate));
        setReport(result);
      } catch (e) {
        console.error(e);
        alert("Failed to generate report.");
      }
    });
  };

  const expenseCategories = report ? Object.keys(report.expensesByCategory).map(key => ({
    name: key.replace("_", " "),
    value: report.expensesByCategory[key]
  })) : [];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white text-base">Generate Profit & Loss Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="space-y-2 w-full sm:w-auto">
              <Label>Start Date</Label>
              <Input 
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="bg-black/40 border-white/10"
              />
            </div>
            <div className="space-y-2 w-full sm:w-auto">
              <Label>End Date</Label>
              <Input 
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="bg-black/40 border-white/10"
              />
            </div>
            <Button 
              onClick={handleGenerate} 
              disabled={isPending}
              className="bg-[#C1121F] hover:bg-[#a00f1a] text-white w-full sm:w-auto"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PieChartIcon className="h-4 w-4 mr-2" />}
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {report && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-white/5 border-white/10 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-zinc-400">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatCurrency(report.totalRevenue)}</div>
                <p className="text-xs text-zinc-500 mt-1">Collected from {report.metadata.invoiceCount} invoices</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-zinc-400">Total Expenses</CardTitle>
                <Wallet className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatCurrency(report.totalExpenses)}</div>
                <p className="text-xs text-zinc-500 mt-1">Across {report.metadata.expenseCount} records</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-zinc-400">Net Profit</CardTitle>
                <TrendingUp className={`h-4 w-4 ${report.netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${report.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrency(report.netProfit)}
                </div>
                <p className="text-xs text-zinc-500 mt-1">Margin: {report.profitMargin.toFixed(2)}%</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-white/5 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white text-base">Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {expenseCategories.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseCategories}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {expenseCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: any) => formatCurrency(Number(value))}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-zinc-500 italic text-sm">
                    No expenses recorded in this period.
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white text-base">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {expenseCategories.map((cat, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-sm text-zinc-300 capitalize">{cat.name}</span>
                      <span className="text-sm font-medium text-white">{formatCurrency(cat.value)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 flex gap-2">
                  <Button variant="outline" className="w-full bg-white/5 border-white/10 text-zinc-300 hover:text-white" onClick={() => window.print()}>
                    <Download className="h-4 w-4 mr-2" /> Print / Export PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
