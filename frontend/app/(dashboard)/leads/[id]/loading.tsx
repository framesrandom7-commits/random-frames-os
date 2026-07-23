import React from "react";
import Topbar from "@/components/dashboard/topbar";
import { Skeleton } from "@/components/ui/skeleton";

export default function LeadLoading() {
  return (
    <>
      <Topbar title="Lead Details" />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#050505]">
        <div className="mb-6 flex flex-col gap-4">
          <Skeleton className="h-8 w-24 bg-white/10" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-64 bg-white/10" />
                <Skeleton className="h-6 w-12 rounded-full bg-white/10" />
              </div>
              <Skeleton className="h-6 w-48 bg-white/10" />
              
              <div className="flex gap-2 mt-3">
                <Skeleton className="h-5 w-16 rounded-full bg-white/10" />
                <Skeleton className="h-5 w-20 rounded-full bg-white/10" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-24 rounded-full bg-white/10" />
              <Skeleton className="h-8 w-24 rounded-full bg-white/10" />
              <Skeleton className="h-10 w-32 bg-white/10" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[250px] w-full rounded-xl bg-white/5" />
            <Skeleton className="h-[400px] w-full rounded-xl bg-white/5" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[200px] w-full rounded-xl bg-white/5" />
            <Skeleton className="h-[150px] w-full rounded-xl bg-white/5" />
            <Skeleton className="h-[200px] w-full rounded-xl bg-white/5" />
          </div>
        </div>
      </main>
    </>
  );
}
