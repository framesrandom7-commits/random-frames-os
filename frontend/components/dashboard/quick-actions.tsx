import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Send, FileText } from "lucide-react";

export default function QuickActions() {
  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-auto flex-col gap-2 py-4 border-white/10 bg-zinc-900/50 hover:bg-white/10 hover:text-white text-zinc-400 transition-all">
          <Plus className="h-5 w-5 text-[#C1121F]" />
          <span>New Lead</span>
        </Button>
        <Button variant="outline" className="h-auto flex-col gap-2 py-4 border-white/10 bg-zinc-900/50 hover:bg-white/10 hover:text-white text-zinc-400 transition-all">
          <Send className="h-5 w-5 text-[#C1121F]" />
          <span>Send Invoice</span>
        </Button>
        <Button variant="outline" className="col-span-2 h-auto flex-row justify-center gap-2 py-3 border-white/10 bg-zinc-900/50 hover:bg-white/10 hover:text-white text-zinc-400 transition-all">
          <FileText className="h-4 w-4" />
          <span>Generate Report</span>
        </Button>
      </CardContent>
    </Card>
  );
}
