"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

interface SettingsPageLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function SettingsPageLayout({ title, children }: SettingsPageLayoutProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div>
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="mb-2 text-zinc-400 hover:text-white px-0 hover:bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Settings
            </Button>
          </Link>
        </div>
        <PageHeader title={title} />
      </div>
      
      <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-6 backdrop-blur-md overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
