"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, PhoneForwarded, CheckCircle, XCircle, TrendingUp, AlertCircle, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface LeadStatsProps {
  stats: {
    total: number;
    newLeads: number;
    contacted: number;
    won: number;
    lost: number;
    dueToday: number;
    overdue: number;
    conversionRate: number;
    monthlyTrend: { name: string; total: number }[];
  } | null;
}

export default function LeadDashboard({ stats }: LeadStatsProps) {
  if (!stats) return null;

  const statCards = [
    { label: "Total Active Leads", value: stats.total, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "New & Contacted", value: stats.newLeads + stats.contacted, icon: PhoneForwarded, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Won", value: stats.won, icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Lost", value: stats.lost, icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Conversion Rate", value: `${stats.conversionRate.toFixed(1)}%`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="border-white/10 bg-white/5 backdrop-blur-md">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-1">{stat.label}</p>
                <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-full ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 border-white/10 bg-white/5 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white text-lg font-medium">Monthly Lead Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.monthlyTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} />
                  <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="total" stroke="#C1121F" strokeWidth={3} dot={{r: 4, fill: '#C1121F'}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 border-white/10 bg-white/5 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white text-lg font-medium">Action Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-400">Overdue Follow-ups</h4>
                <p className="text-2xl font-bold text-white mt-1">{stats.overdue}</p>
                <p className="text-sm text-red-400/80 mt-1">Requires immediate attention</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Calendar className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-400">Due Today</h4>
                <p className="text-2xl font-bold text-white mt-1">{stats.dueToday}</p>
                <p className="text-sm text-amber-400/80 mt-1">Follow-ups scheduled for today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
