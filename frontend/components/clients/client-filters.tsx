"use client";

import React, { useTransition } from "react";
import { Filter, X } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BusinessType } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ClientFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const businessType = searchParams.get("businessType") as BusinessType | "";
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
    params.delete("businessType");
    params.delete("archived");
    params.set("page", "1");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const activeCount = [businessType, archived ? "true" : ""].filter(Boolean).length;

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
          <h4 className="font-medium">Filter Clients</h4>
          {activeCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs text-zinc-400 hover:text-white px-2">
              <X className="h-3 w-3 mr-1" /> Clear
            </Button>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-zinc-400">Business Type</Label>
            <Select value={businessType || ""} onValueChange={(val) => updateParam("businessType", val === "ALL" ? "" : (val || ""))}>
              <SelectTrigger className="bg-black/40 border-white/10 h-9">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10 text-white max-h-48">
                <SelectItem value="ALL">All Types</SelectItem>
                {Object.values(BusinessType).map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <Label htmlFor="archived-toggle" className="text-sm cursor-pointer">Show Archived</Label>
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
