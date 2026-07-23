import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SearchX } from "lucide-react";

export default function LeadNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-6">
      <div className="w-20 h-20 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center mb-2">
        <SearchX className="w-10 h-10 text-zinc-500" />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">Lead Not Found</h2>
        <p className="text-zinc-400 max-w-[350px] mx-auto text-lg">
          The requested lead could not be found.
        </p>
      </div>
      <div className="pt-4">
        <Link href="/leads">
          <Button className="bg-[#C1121F] hover:bg-[#a00f1a] text-white px-8 py-6 text-lg h-auto rounded-md shadow-lg shadow-red-900/20">
            Back to Leads
          </Button>
        </Link>
      </div>
    </div>
  );
}
