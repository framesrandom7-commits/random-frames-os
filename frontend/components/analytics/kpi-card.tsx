import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  formatter?: 'currency' | 'number' | 'percent';
}

export function KpiCard({ title, value, trend, trendLabel, icon, formatter = 'number' }: KpiCardProps) {
  const formattedValue = React.useMemo(() => {
    if (typeof value === 'number') {
      if (formatter === 'currency') return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
      if (formatter === 'percent') return `${value}%`;
      return new Intl.NumberFormat('en-US').format(value);
    }
    return value;
  }, [value, formatter]);

  return (
    <Card className="bg-[#111] border-white/10 shadow-md hover:bg-[#1a1a1a] transition-all">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-zinc-400">{title}</CardTitle>
        <div className="h-4 w-4 text-zinc-500">
          {icon || <TrendingUp size={16} />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{formattedValue}</div>
        {trend !== undefined && (
          <div className="flex items-center text-xs mt-1">
            <span className={cn(
              "flex items-center font-medium",
              trend > 0 ? "text-emerald-500" : trend < 0 ? "text-rose-500" : "text-zinc-500"
            )}>
              {trend > 0 ? <ArrowUpRight size={14} className="mr-1" /> : trend < 0 ? <ArrowDownRight size={14} className="mr-1" /> : null}
              {Math.abs(trend)}%
            </span>
            {trendLabel && <span className="text-zinc-500 ml-2">{trendLabel}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
