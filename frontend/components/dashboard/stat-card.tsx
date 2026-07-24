import React from "react";
import { PremiumCard } from "@/components/ui/premium-card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend: string;
}

export default function StatCard({ title, value, icon: Icon, trend }: StatCardProps) {
  return (
    <PremiumCard hoverEffect className="p-6 flex flex-col gap-4">
      <div className="flex flex-row items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-400">{title}</h3>
        <Icon className="h-4 w-4 text-zinc-500" />
      </div>
      <div>
        <div className="text-2xl font-bold text-white">{value}</div>
        {trend && <p className="text-xs text-zinc-500 mt-1">{trend}</p>}
      </div>
    </PremiumCard>
  );
}
