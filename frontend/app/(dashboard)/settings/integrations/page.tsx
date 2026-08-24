import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { getIntegrationStatuses } from "@/app/actions/integrations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HardDrive, Mail, Cloud, MessageSquare, Briefcase, Database, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { IntegrationsNav } from "@/components/settings/integrations-nav";

export const dynamic = "force-dynamic";

export default async function IntegrationsHubPage() {
  const response = await getIntegrationStatuses();
  const providers = response.data || [];

  const getIcon = (type: string) => {
    switch (type) {
      case "STORAGE": return <Cloud className="text-blue-500" />;
      case "EMAIL": return <Mail className="text-rose-500" />;
      case "WHATSAPP": return <MessageSquare className="text-emerald-500" />;
      case "ACCOUNTING": return <Briefcase className="text-purple-500" />;
      default: return <Database className="text-zinc-500" />;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <IntegrationsNav />
      <div className="flex flex-col gap-2">
        <PageHeader title="Integration Hub" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {providers.map((provider) => (
          <Card key={provider.id} className="bg-[#111] border-white/10 shadow-md">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg">
                  {getIcon(provider.type)}
                </div>
                <div>
                  <CardTitle className="text-white text-base">{provider.name}</CardTitle>
                  <CardDescription className="text-zinc-400 text-xs uppercase tracking-wider">{provider.type}</CardDescription>
                </div>
              </div>
              <div>
                {provider.isConfigured ? (
                  <span className="flex items-center text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                    <CheckCircle2 size={12} className="mr-1" /> Active
                  </span>
                ) : (
                  <span className="flex items-center text-xs font-medium text-zinc-500 bg-zinc-500/10 px-2 py-1 rounded-full">
                    <AlertCircle size={12} className="mr-1" /> Inactive
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-zinc-400 mb-6 min-h-[40px]">
                {provider.description}
              </p>
              
              <div className="flex justify-end border-t border-white/5 pt-4">
                {provider.id === "GOOGLE_DRIVE" || provider.id === "google_drive" ? (
                  <div className="flex w-full justify-between items-center gap-2">
                    <span className="text-xs text-zinc-500">
                      {provider.isConfigured ? (provider.healthStatus === "HEALTHY" ? "Operational" : "Active") : "Not Configured"}
                    </span>
                    <Link href="/settings/integrations/google-drive">
                      <Button variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/5">
                        Manage
                      </Button>
                    </Link>
                  </div>
                ) : provider.id === "GOOGLE_CALENDAR" || provider.id === "google_calendar" ? (
                  <div className="flex w-full justify-between items-center gap-2">
                    <span className="text-xs text-zinc-500">
                      {provider.isConfigured ? (provider.healthStatus === "HEALTHY" ? "Operational" : "Active") : "Not Configured"}
                    </span>
                    <Link href="/settings/integrations/google-calendar">
                      <Button variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/5">
                        Manage
                      </Button>
                    </Link>
                  </div>
                ) : provider.id.includes("WHATSAPP") || provider.id === "whatsapp" ? (
                  <div className="flex w-full justify-between items-center gap-2">
                    <span className="text-xs text-zinc-500">
                      {provider.isConfigured ? (provider.healthStatus === "HEALTHY" ? "Operational" : "Active") : "Not Configured"}
                    </span>
                    <Link href="/settings/integrations/whatsapp">
                      <Button variant="outline" size="sm" className={provider.isConfigured ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10" : "border-white/10 text-white hover:bg-white/5"}>
                        {provider.isConfigured ? "Manage Cloud API" : "Configure"}
                      </Button>
                    </Link>
                  </div>
                ) : provider.id === "SMTP_EMAIL" || provider.type === "EMAIL" ? (
                  <div className="flex w-full justify-between items-center gap-2">
                    <span className="text-xs text-zinc-500">
                      {provider.isConfigured ? (provider.healthStatus === "HEALTHY" ? "Operational" : "Active") : "Not Configured"}
                    </span>
                    <Link href="/settings/integrations/email">
                      <Button variant="outline" size="sm" className={provider.isConfigured ? "border-rose-500/30 text-rose-400 hover:bg-rose-500/10" : "border-white/10 text-white hover:bg-white/5"}>
                        {provider.isConfigured ? "Manage Server" : "Configure"}
                      </Button>
                    </Link>
                  </div>
                ) : provider.isConfigured ? (
                  <div className="flex w-full justify-between items-center">
                    <span className="text-xs text-zinc-500">
                      {provider.healthStatus === "HEALTHY" ? "Operational" : "Unknown Status"}
                    </span>
                    <Button variant="outline" size="sm" className="border-rose-500/50 text-rose-500 hover:bg-rose-500/10">
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" className="border-white/10 text-white w-full">
                    Configure
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
