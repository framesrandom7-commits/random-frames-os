"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PieChartData {
  name: string;
  value: number;
}

interface PieChartProps {
  title: string;
  description?: string;
  data: PieChartData[];
  colors?: string[];
}

const DEFAULT_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

export function PieChart({ title, description, data, colors = DEFAULT_COLORS }: PieChartProps) {
  return (
    <Card className="bg-[#111] border-white/10 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-white">{title}</CardTitle>
        {description && <CardDescription className="text-zinc-400">{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#fff', fontSize: '12px' }} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
