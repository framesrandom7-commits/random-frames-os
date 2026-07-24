import React from "react";
import Sidebar from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/layout/top-bar";

export default function AppShell({ children, user }: { children: React.ReactNode, user?: { name: string, roleName: string } }) {
  return (
    <div className="flex h-screen w-full bg-[#08090A] text-white selection:bg-[#E53935]/30 overflow-hidden relative items-center justify-center p-4 lg:p-6">
      
      {/* Global Cinematic Background Canvas */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Subtle noise and grid */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]" />
        
        {/* Deep atmospheric lighting */}
        <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] max-w-[1000px] max-h-[1000px] bg-red-900/10 rounded-full blur-[140px] mix-blend-screen opacity-40" />
        <div className="absolute top-[10%] right-[10%] w-[30vw] h-[30vw] max-w-[500px] max-h-[500px] bg-[#E53935]/10 rounded-full blur-[100px] mix-blend-screen opacity-30" />
        
        {/* Ambient bottom glow */}
        <div className="absolute -bottom-[20%] -left-[10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-blue-900/10 rounded-full blur-[120px] mix-blend-screen opacity-20" />
      </div>

      {/* Primary Application Window */}
      <div className="relative z-10 flex h-full w-full max-w-[2000px] mx-auto overflow-hidden rounded-[32px] bg-[#0F1115]/95 backdrop-blur-3xl border border-white/[0.08] shadow-[0_30px_100px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)]">
        
        {/* Integrated Sidebar */}
        <Sidebar />

        {/* Workspace Area */}
        <div className="flex flex-1 flex-col overflow-hidden relative">
          
          {/* Top Navigation Command Center */}
          <TopBar user={user} />
          
          {/* Module Content */}
          <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8">
            <div className="mx-auto max-w-[1600px] w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
