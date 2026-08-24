"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function IntegrationsNav() {
  const pathname = usePathname();

  // Highlight 'Providers' for the main hub and any specific provider sub-pages
  const isProviders = pathname === "/settings/integrations" || 
                      pathname.startsWith("/settings/integrations/whatsapp") || 
                      pathname.startsWith("/settings/integrations/google") ||
                      pathname.startsWith("/settings/integrations/email");
                      
  const isWebhooks = pathname === "/settings/integrations/webhooks";
  const isBackups = pathname === "/settings/integrations/backups";

  const isRootIntegrationsPage = 
    pathname === "/settings/integrations" || 
    pathname === "/settings/integrations/webhooks" || 
    pathname === "/settings/integrations/backups";

  return (
    <div className="flex flex-col gap-4 w-full mb-6">
      <div className="flex flex-col gap-2">
        {isRootIntegrationsPage ? (
          <Link href="/settings?tab=integrations" className="text-sm text-zinc-400 hover:text-white transition-colors w-fit">
            ← Back to Settings
          </Link>
        ) : (
          <Link href="/settings/integrations" className="text-sm text-zinc-400 hover:text-white transition-colors w-fit">
            ← Back to Integration Hub
          </Link>
        )}
      </div>
      <div className="flex gap-2">
        <Link href="/settings/integrations" className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isProviders ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}>Providers</Link>
        <Link href="/settings/integrations/webhooks" className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isWebhooks ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}>Webhooks</Link>
        <Link href="/settings/integrations/backups" className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isBackups ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}>Backups & Data</Link>
      </div>
    </div>
  );
}
