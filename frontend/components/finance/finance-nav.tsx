"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Receipt, PieChart } from "lucide-react";

export default function FinanceNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/finance", icon: LayoutDashboard },
    { name: "Invoices", href: "/finance/invoices", icon: FileText },
    { name: "Expenses", href: "/finance/expenses", icon: Receipt },
  ];

  return (
    <div className="flex space-x-1 bg-white/5 p-1 rounded-lg border border-white/10 w-fit">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/finance" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? "bg-[#C1121F] text-white shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
