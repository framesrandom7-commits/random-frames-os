"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Users, UserCircle, Briefcase, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RbacDomainService } from "@/domain/rbac/service";

export default function GreetingWidget({
  user,
  metrics
}: {
  user: { name: string, roleName: string };
  metrics?: { activeProjectsCount: number, openLeadsCount: number, pendingInvoicesAmount: number, shootsTodayCount: number };
}) {
  const [greeting, setGreeting] = useState("Good Morning");
  const [dateStr, setDateStr] = useState("");
  const [mounted, setMounted] = useState(false);

  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
     
    setMounted(true);
    const date = new Date();
    const hour = date.getHours();

    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    const formattedDate = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
    setDateStr(formattedDate);

    setPortalTarget(document.getElementById("topbar-title-portal"));
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="space-y-3">
          <div className="h-4 w-32 bg-white/5 rounded-md" />
          <div className="h-10 w-64 bg-white/5 rounded-md" />
        </div>
      </div>
    );
  }

  // We'll portal this greeting to the TopBar to keep it aligned with other pages
  const greetingContent = mounted ? (
    <div className="flex flex-col gap-2">
      <span className="text-[#E53935] text-4xl font-extrabold tracking-[0.1em] uppercase leading-none">
        {greeting},
      </span>
      <h1 className="text-3xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500 leading-none">
        {user.name}
      </h1>
    </div>
  ) : null;

  return (
    <div className="space-y-8 mb-4">
      {portalTarget && mounted ? createPortal(greetingContent, portalTarget) : null}

      <div className="flex flex-col gap-6">

        {/* Business Summary */}
        <div className="space-y-1">
          <p className="text-zinc-350 text-4xl font-bold">
            {RbacDomainService.getPersonalizedDashboardContext(user.roleName, user.name).subtitle}
          </p>

          {/* Business Summary */}
          <div className="flex flex-wrap items-center gap-3 mt-4 text-sm font-medium text-zinc-400">
            <span>{metrics?.activeProjectsCount ?? 0} Active Projects</span>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <span className="mt-1 sm:mt-0">{metrics?.openLeadsCount ?? 0} Open Leads</span>
            <span className="text-zinc-600 hidden md:inline">•</span>
            <span className="mt-1 md:mt-0">
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(metrics?.pendingInvoicesAmount ?? 0)} Pending
            </span>
            <span className="text-zinc-600 hidden lg:inline">•</span>
            <span className="mt-1 lg:mt-0">{metrics?.shootsTodayCount ?? 0} Shoots Today</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Link href="?new=lead">
            <Button variant="outline" size="sm" className="h-10 px-5 rounded-full bg-[#171A21] border-white/5 hover:border-white/20 hover:bg-[#262B36] hover:text-white text-zinc-300 transition-all duration-300 shadow-[0_4px_10px_rgb(0,0,0,0.2)]">
              <Users className="w-4 h-4 mr-2 text-[#E53935]" />
              <span className="font-medium">New Lead</span>
            </Button>
          </Link>
          <Link href="?new=client">
            <Button variant="outline" size="sm" className="h-10 px-5 rounded-full bg-[#171A21] border-white/5 hover:border-white/20 hover:bg-[#262B36] hover:text-white text-zinc-300 transition-all duration-300 shadow-[0_4px_10px_rgb(0,0,0,0.2)]">
              <UserCircle className="w-4 h-4 mr-2 text-[#F59E0B]" />
              <span className="font-medium">New Client</span>
            </Button>
          </Link>
          <Link href="?new=project">
            <Button variant="outline" size="sm" className="h-10 px-5 rounded-full bg-[#171A21] border-white/5 hover:border-white/20 hover:bg-[#262B36] hover:text-white text-zinc-300 transition-all duration-300 shadow-[0_4px_10px_rgb(0,0,0,0.2)]">
              <Briefcase className="w-4 h-4 mr-2 text-[#8B5CF6]" />
              <span className="font-medium">New Project</span>
            </Button>
          </Link>
          <Link href="?new=shoot">
            <Button variant="outline" size="sm" className="h-10 px-5 rounded-full bg-[#171A21] border-white/5 hover:border-white/20 hover:bg-[#262B36] hover:text-white text-zinc-300 transition-all duration-300 shadow-[0_4px_10px_rgb(0,0,0,0.2)]">
              <Camera className="w-4 h-4 mr-2 text-[#3B82F6]" />
              <span className="font-medium">New Shoot</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
