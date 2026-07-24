import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { getWebhooks } from "@/app/actions/integrations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function WebhooksPage() {
  const response = await getWebhooks();
  const webhooks = response.data || [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Webhooks" 
        subtitle="Manage outgoing event subscriptions"
        action={
          <Button className="bg-[#E53935] hover:bg-[#D32F2F] text-white">
            <Plus size={16} className="mr-2" /> Add Webhook
          </Button>
        }
      />

      <div className="flex gap-2 mb-4">
        <Link href="/settings/integrations" className="px-4 py-2 text-zinc-400 hover:bg-white/5 hover:text-white rounded-md text-sm font-medium transition-colors">Providers</Link>
        <Link href="/settings/integrations/webhooks" className="px-4 py-2 bg-white/10 text-white rounded-md text-sm font-medium">Webhooks</Link>
        <Link href="/settings/integrations/backups" className="px-4 py-2 text-zinc-400 hover:bg-white/5 hover:text-white rounded-md text-sm font-medium transition-colors">Backups & Data</Link>
      </div>

      <div className="space-y-4">
        {webhooks.length === 0 ? (
          <div className="text-center py-12 bg-[#111] rounded-xl border border-white/5">
            <Activity className="mx-auto h-12 w-12 text-zinc-500 mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-white mb-2">No webhooks configured</h3>
            <p className="text-zinc-400 text-sm max-w-sm mx-auto">
              Add a webhook endpoint to receive real-time HTTP POST notifications when events occur in the system.
            </p>
          </div>
        ) : (
          webhooks.map((webhook) => (
            <Card key={webhook.id} className="bg-[#111] border-white/10 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <div>
                  <CardTitle className="text-white text-base">{webhook.name}</CardTitle>
                  <CardDescription className="text-zinc-400 font-mono text-xs mt-1">{webhook.url}</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-xs">
                    <div className="text-zinc-400 mb-1">Status: <span className={webhook.isActive ? "text-emerald-500" : "text-rose-500"}>{webhook.isActive ? "Active" : "Disabled"}</span></div>
                    <p className="text-xs text-zinc-500 mt-2">Last Sync: {webhook.lastSuccessAt ? new Date(webhook.lastSuccessAt).toLocaleString() : 'Never'}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
