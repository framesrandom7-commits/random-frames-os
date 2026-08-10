import React from "react";
import FinanceNav from "@/components/finance/finance-nav";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Access granted via RBAC routing config
  return (
    <div className="flex flex-col h-full overflow-hidden p-8 gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">Finance</h1>
        <FinanceNav />
      </div>
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
