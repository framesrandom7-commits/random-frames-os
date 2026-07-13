"use client";

import React, { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LeadStatus, LeadPriority, LeadSource } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

export default function LeadFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const status = searchParams.get("status") as LeadStatus | "";
  const priority = searchParams.get("priority") as LeadPriority | "";
  const source = searchParams.get("source") as LeadSource | "";
  const archived = searchParams.get("archived") === "true";

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1"); // Reset pagination
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("status");
    params.delete("priority");
    params.delete("source");
    params.delete("archived");
    params.set("page", "1");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const activeCount = [status, priority, source, archived ? "true" : ""].filter(Boolean).length;

  return (
    <Popover>
      <PopoverTrigger className="inline-flex h-9 items-center justify-center rounded-lg border border-white/10 bg-black/40 px-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white relative">
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <Badge className="ml-2 bg-[#C1121F] text-white hover:bg-[#a00f1a] rounded-sm px-1 py-0 h-5">
              {activeCount}
            </Badge>
          )}
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-[#111] border-white/10 text-white p-4" align="end">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium">Filter Leads</h4>
          {activeCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs text-zinc-400 hover:text-white px-2">
              <X className="h-3 w-3 mr-1" /> Clear
            </Button>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-zinc-400">Status</Label>
            <Select value={status || ""} onValueChange={(val) => updateParam("status", val === "ALL" ? "" : (val || ""))}>
              <SelectTrigger className="bg-black/40 border-white/10 h-9">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                <SelectItem value="ALL">All Statuses</SelectItem>
                {Object.values(LeadStatus).map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-zinc-400">Priority</Label>
            <Select value={priority || ""} onValueChange={(val) => updateParam("priority", val === "ALL" ? "" : (val || ""))}>
              <SelectTrigger className="bg-black/40 border-white/10 h-9">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                <SelectItem value="ALL">All Priorities</SelectItem>
                {Object.values(LeadPriority).map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-zinc-400">Source</Label>
            <Select value={source || ""} onValueChange={(val) => updateParam("source", val === "ALL" ? "" : (val || ""))}>
              <SelectTrigger className="bg-black/40 border-white/10 h-9">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10 text-white max-h-48">
                <SelectItem value="ALL">All Sources</SelectItem>
                {Object.values(LeadSource).map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <Label htmlFor="archived-toggle" className="text-sm cursor-pointer">Show Deleted</Label>
            <Switch 
              id="archived-toggle"
              checked={archived}
              onCheckedChange={(checked) => updateParam("archived", checked ? "true" : "")}
              className="data-[state=checked]:bg-[#C1121F]"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
