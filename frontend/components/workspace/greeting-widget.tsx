"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Users, UserCircle, Briefcase, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GreetingWidget({ user }: { user: { name: string, roleName: string } }) {
  const [greeting, setGreeting] = useState("Good Morning");
  const [dateStr, setDateStr] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  return (
    <div className="space-y-8 mb-4">
      <div className="flex flex-col gap-6">

        {/* Greeting */}
        <div className="space-y-1">
          <p className="text-[#E53935] text-xl font-bold tracking-[0.2em] uppercase mb-2">
            {greeting},
          </p>
          <h1 className="text-5xl font-bold tracking-tight flex items-center gap-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500">
              {user.name}
            </span>
          </h1>
          <p className="text-zinc-500 text-base font-bold mt-3">
            Welcome back to Random Frames
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Link href="/leads/new">
            <Button variant="outline" size="sm" className="h-10 px-5 rounded-full bg-[#171A21] border-white/5 hover:border-white/20 hover:bg-[#262B36] hover:text-white text-zinc-300 transition-all duration-300 shadow-[0_4px_10px_rgb(0,0,0,0.2)]">
              <Users className="w-4 h-4 mr-2 text-[#E53935]" />
              <span className="font-medium">New Lead</span>
            </Button>
          </Link>
          <Link href="/clients/new">
            <Button variant="outline" size="sm" className="h-10 px-5 rounded-full bg-[#171A21] border-white/5 hover:border-white/20 hover:bg-[#262B36] hover:text-white text-zinc-300 transition-all duration-300 shadow-[0_4px_10px_rgb(0,0,0,0.2)]">
              <UserCircle className="w-4 h-4 mr-2 text-[#F59E0B]" />
              <span className="font-medium">New Client</span>
            </Button>
          </Link>
          <Link href="/projects/new">
            <Button variant="outline" size="sm" className="h-10 px-5 rounded-full bg-[#171A21] border-white/5 hover:border-white/20 hover:bg-[#262B36] hover:text-white text-zinc-300 transition-all duration-300 shadow-[0_4px_10px_rgb(0,0,0,0.2)]">
              <Briefcase className="w-4 h-4 mr-2 text-[#8B5CF6]" />
              <span className="font-medium">New Project</span>
            </Button>
          </Link>
          <Link href="/shoots/new">
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
