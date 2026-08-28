import React from "react";
import FinanceNav from "@/components/finance/finance-nav";
import { PageHeader } from "@/components/layout/page-header";
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
    <>
      <PageHeader title="Finance" />
      <div className="flex flex-col h-full overflow-hidden p-6 lg:p-8">
        <div className="flex justify-center mb-6 shrink-0">
          <FinanceNav />
        </div>
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </>
  );
}
