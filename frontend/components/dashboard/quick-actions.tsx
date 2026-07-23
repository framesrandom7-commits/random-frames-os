import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Send, FileText } from "lucide-react";
import Link from "next/link";

export default function QuickActions() {
  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <Link href="/leads?new=true" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-auto flex-col gap-2 py-4 border border-white/10 bg-zinc-900/50 hover:bg-white/10 hover:text-white text-zinc-400 cursor-pointer">
          <Plus className="h-5 w-5 text-[#C1121F]" />
          <span>New Lead</span>
        </Link>
        <Link href="/finance?new=true" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-auto flex-col gap-2 py-4 border border-white/10 bg-zinc-900/50 hover:bg-white/10 hover:text-white text-zinc-400 cursor-pointer">
          <Send className="h-5 w-5 text-[#C1121F]" />
          <span>Send Invoice</span>
        </Link>
        <Link href="/reports" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 col-span-2 h-auto flex-row gap-2 py-3 border border-white/10 bg-zinc-900/50 hover:bg-white/10 hover:text-white text-zinc-400 cursor-pointer">
          <FileText className="h-4 w-4" />
          <span>Generate Report</span>
        </Link>
      </CardContent>
    </Card>
  );
}
