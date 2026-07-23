"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function LeadError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log server errors only on the server, but Next.js error.tsx runs on client.
    // However, the actual error is logged on the server by Next.js automatically.
    // We do NOT expose the stack trace in the UI.
    console.error("Lead details error:", error.message);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center space-y-4">
      <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-white">Something went wrong!</h2>
      <p className="text-zinc-400 max-w-md">
        An error occurred while loading this lead. This could be due to a database connection failure or a temporary server issue.
      </p>
      <div className="flex gap-4 mt-6">
        <Button onClick={reset} variant="outline" className="border-white/10 hover:bg-white/10 text-white">
          Try again
        </Button>
        <Link href="/leads">
          <Button className="bg-[#C1121F] hover:bg-[#a00f1a] text-white">
            Back to Leads
          </Button>
        </Link>
      </div>
    </div>
  );
}
