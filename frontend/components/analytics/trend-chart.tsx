"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface TrendChartProps {
  title: string;
  description?: string;
  data: any[];
  dataKey: string;
  categoryKey: string;
  color?: string;
}

export function TrendChart({ title, description, data, dataKey, categoryKey, color = "#3b82f6" }: TrendChartProps) {
  return (
    <Card className="bg-[#111] border-white/10 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-white">{title}</CardTitle>
        {description && <CardDescription className="text-zinc-400">{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey={categoryKey} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#71717a', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#71717a', fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color} 
                strokeWidth={2}
                fillOpacity={1} 
                fill={`url(#color-${dataKey})`} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
