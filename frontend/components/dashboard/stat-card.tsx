import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend: string;
}

export default function StatCard({ title, value, icon: Icon, trend }: StatCardProps) {
  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-lg transition-all duration-300 hover:bg-white/10 hover:shadow-xl hover:ring-1 hover:ring-white/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-zinc-400">{title}</CardTitle>
        <Icon className="h-4 w-4 text-zinc-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        <p className="text-xs text-zinc-500 mt-1">{trend}</p>
      </CardContent>
    </Card>
  );
}
