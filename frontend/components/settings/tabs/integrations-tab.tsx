"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { GoogleWorkspaceSettingsCard } from "./google-workspace-settings";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Settings2, ArrowRight } from "lucide-react";

export default function IntegrationsTab() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (searchParams.get('success') === 'GoogleAuthConnected') {
      toast.success('Successfully connected Google Workspace!');
      // Clean up the URL
      router.replace(pathname, { scroll: false });
    } else if (searchParams.get('error')) {
      toast.error('Failed to connect Google Workspace: ' + searchParams.get('error'));
      router.replace(pathname, { scroll: false });
    }
  }, [searchParams, router, pathname]);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h3 className="text-xl font-semibold text-white tracking-tight">Integrations</h3>
        <p className="text-sm text-zinc-400 mt-1">Connect Random Frames OS with your external tools for automation.</p>
      </div>

      <GoogleWorkspaceSettingsCard />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-xl transition-all hover:bg-white/10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-blue-500/10 text-blue-400">
            <Settings2 className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1">
            <h4 className="text-white font-medium text-base">Advanced Integration Hub</h4>
            <p className="text-sm text-zinc-400">Manage all third-party providers, webhooks, accounting stubs, local storage, and WhatsApp configurations.</p>
          </div>
        </div>
        
        <div className="flex items-center shrink-0">
          <Link href="/settings/integrations">
            <Button className="bg-white text-black hover:bg-zinc-200">
              Open Integration Hub <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
