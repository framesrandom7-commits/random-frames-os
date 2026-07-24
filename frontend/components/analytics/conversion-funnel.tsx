"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Funnel, FunnelChart, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

interface FunnelData {
  name: string;
  value: number;
}

interface ConversionFunnelProps {
  title: string;
  description?: string;
  data: FunnelData[];
  color?: string;
}

export function ConversionFunnel({ title, description, data, color = "#8b5cf6" }: ConversionFunnelProps) {
  return (
    <Card className="bg-[#111] border-white/10 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-white">{title}</CardTitle>
        {description && <CardDescription className="text-zinc-400">{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <FunnelChart>
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Funnel
                dataKey="value"
                data={data}
                isAnimationActive
                fill={color}
                stroke="rgba(0,0,0,0)"
              >
                <LabelList position="right" fill="#fff" stroke="none" dataKey="name" />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
