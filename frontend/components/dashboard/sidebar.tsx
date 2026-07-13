"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, UserCircle, Briefcase, Camera, Calendar, DollarSign, BarChart, Settings, Aperture } from "lucide-react";
import { cn } from "@/lib/utils";
import UserProfile from "./user-profile";
import QuickCreateMenu from "./quick-create-menu";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Leads", href: "/leads", icon: Users },
  { name: "Clients", href: "/clients", icon: UserCircle },
  { name: "Projects", href: "/projects", icon: Briefcase },
  { name: "Shoots", href: "/shoots", icon: Camera },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Finance", href: "/finance", icon: DollarSign },
  { name: "Reports", href: "/reports", icon: BarChart },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r border-white/10 bg-black text-white">
      <div className="flex h-16 shrink-0 items-center gap-3 px-6 border-b border-white/5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C1121F] text-white shadow-lg">
          <Aperture size={20} strokeWidth={2} />
        </div>
        <span className="text-lg font-bold tracking-tight">Random Frames</span>
      </div>
      
      <div className="px-4 py-4 shrink-0">
        <QuickCreateMenu />
      </div>
      
      <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-4">
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (pathname === "/" && item.href === "/dashboard");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive ? "text-[#C1121F]" : "text-zinc-500 group-hover:text-zinc-300"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="border-t border-white/10 p-4">
        <UserProfile />
      </div>
    </div>
  );
}
