import React from "react";
import Topbar from "@/components/dashboard/topbar";

export default function ShootsPage() {
  return (
    <>
      <Topbar title="Shoots" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-8 flex items-center text-sm text-zinc-500">
          <span>Home</span>
          <span className="mx-2">/</span>
          <span className="text-zinc-300">Shoots</span>
        </div>
        
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
          <h2 className="text-xl font-medium text-white">Shoots Content</h2>
          <p className="mt-2 text-zinc-400">Placeholder content for the Shoots page.</p>
        </div>
      </main>
    </>
  );
}
