import React from "react";
import Sidebar from "@/components/dashboard/sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-black">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden bg-[#050505]">
        {children}
      </div>
    </div>
  );
}
