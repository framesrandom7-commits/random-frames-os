"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, LayoutDashboard, Users, Target, Calendar, Video, 
  Film, CheckCircle2, Share2, LineChart, CreditCard, MessageCircle,
  Briefcase, CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ShootTable from "@/components/shoots/shoot-table";
import InvoicesTable from "@/components/finance/invoices-table";
import { StrategyModule } from "@/components/clients/strategy-module";
import { CalendarModule } from "@/components/clients/calendar-module";
import { ContentPipelineModule } from "@/components/clients/content-pipeline-module";
import { ApprovalsModule } from "@/components/clients/approvals-module";
import { AnalyticsModule } from "@/components/clients/analytics-module";
import { ClientStrategy } from "@prisma/client";
import { WhatsAppConversationWidget } from "@/components/shared/whatsapp-conversation-widget";
import { projectConfig } from "@/components/projects/project-config";
import { ModuleDetailsLayout, ModuleDetailsBody, ModuleDetailsContent, ModuleDetailsSection } from "@/components/ui/module";
import { PageHeader } from "@/components/layout/page-header";
import { ClientDeleteButton } from "@/components/clients/client-delete-button";

interface InternalWorkspaceDashboardProps {
  clientId: string;
  clientName: string;
  contactPerson: string;
  clientCode: string;
  projects: any[];
  shoots: any[];
  invoices: any[];
  clientsForTable: any[];
  strategy: ClientStrategy | null;
  calendarEvents: any[];
  contentDeliverables: any[];
  quotations: any[];
  contentMetrics: any[];
}

export default function InternalWorkspaceDashboard({
  clientId,
  clientName,
  contactPerson,
  clientCode,
  projects,
  shoots,
  invoices,
  clientsForTable,
  strategy,
  calendarEvents,
  contentDeliverables,
  quotations,
  contentMetrics
}: InternalWorkspaceDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("OVERVIEW");

  const tabs = [
    { id: "OVERVIEW", label: "Overview", icon: LayoutDashboard },
    { id: "STRATEGY", label: "Strategy", icon: Target },
    { id: "CONTENT_CALENDAR", label: "Content Calendar", icon: Calendar },
    { id: "SHOOT_PLANNING", label: "Shoot Planning", icon: Video },
    { id: "CONTENT", label: "Content", icon: Film },
    { id: "APPROVALS", label: "Approvals", icon: CheckCircle2 },
    { id: "ANALYTICS_PUBLISHING", label: "Analytics & Publishing", icon: LineChart },
    { id: "INVOICES", label: "Invoices", icon: CreditCard },
    { id: "COMMUNICATION", label: "Communication", icon: MessageCircle },
  ];

  return (
    <ModuleDetailsLayout>

      
      <PageHeader
        title={
          <div className="flex flex-col">
            <span className="text-xs font-semibold tracking-widest text-[#C1121F] uppercase leading-none mb-1">Client Workspace</span>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl font-bold text-white tracking-tight">{clientName}</span>
              <Badge variant="outline" className="bg-white/5 text-zinc-300 font-mono text-sm py-0.5">
                {clientCode}
              </Badge>
            </div>
            {contactPerson && <span className="text-base text-zinc-400 leading-none">Primary Contact: {contactPerson}</span>}
          </div>
        }
        action={<ClientDeleteButton clientId={clientId} clientName={clientName} />}
      />

      <ModuleDetailsBody className="block w-full">
        <div className="flex flex-col md:flex-row gap-6 lg:gap-10">
          
          {/* Vertical Navigation Sidebar */}
          <div className="w-full md:w-64 shrink-0 flex flex-col gap-1 md:sticky md:top-6 h-fit">
            <Link href={`/clients/${clientId}`} className="mb-6 px-3">
              <Button variant="ghost" className="w-fit text-zinc-400 hover:text-white p-0 h-auto">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Client Details
              </Button>
            </Link>

            <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 px-3">Modules</div>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full text-left ${
                    isActive 
                      ? "bg-[#C1121F]/10 text-[#C1121F]" 
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#C1121F]" : "text-zinc-500"}`} />
                    {tab.label}
                  </div>
                  
                </button>
              );
            })}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 pb-12 min-h-[calc(100vh-200px)]">
            {/* OVERVIEW TAB */}
          {activeTab === "OVERVIEW" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl border border-white/10 bg-white/5">
                  <p className="text-sm text-zinc-400 mb-1">Active Projects</p>
                  <p className="text-3xl font-bold">{projects.length}</p>
                </div>
                <div className="p-5 rounded-xl border border-white/10 bg-white/5">
                  <p className="text-sm text-zinc-400 mb-1">Scheduled Shoots</p>
                  <p className="text-3xl font-bold">{shoots.length}</p>
                </div>
                <div className="p-5 rounded-xl border border-white/10 bg-white/5">
                  <p className="text-sm text-zinc-400 mb-1">Total Invoices</p>
                  <p className="text-3xl font-bold">{invoices.length}</p>
                </div>
              </div>

              <ModuleDetailsSection>
                <div className="flex flex-row items-center justify-between pb-4 border-b border-white/10 mb-4">
                  <div className="text-white text-lg flex items-center gap-2 font-medium">
                    <Briefcase className="w-5 h-5 text-zinc-400" />
                    Associated Projects
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map(p => (
                    <div key={p.id}>{projectConfig.cardRender(p)}</div>
                  ))}
                  {projects.length === 0 && (
                    <p className="text-zinc-500 text-sm">No projects currently linked to this client.</p>
                  )}
                </div>
              </ModuleDetailsSection>
            </div>
          )}

          {/* CONTENT TAB */}
          {activeTab === "CONTENT" && (
            <ContentPipelineModule clientId={clientId} deliverables={contentDeliverables} />
          )}

                    {/* APPROVALS TAB */}
          {activeTab === "APPROVALS" && (
            <ApprovalsModule clientId={clientId} quotations={quotations} contentDeliverables={contentDeliverables} />
          )}

          {/* SHOOT PLANNING TAB */}
          {activeTab === "SHOOT_PLANNING" && (
            <ModuleDetailsSection className="animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                <h2 className="text-lg font-medium text-white flex items-center gap-2">
                  <Video className="w-5 h-5 text-zinc-400" />
                  Shoot Planning
                </h2>
              </div>
              <ShootTable 
                shoots={shoots} 
                clients={clientsForTable} 
                projects={projects}
                total={shoots.length}
                variant="list"
              />
            </ModuleDetailsSection>
          )}

          {/* INVOICES TAB */}
          {activeTab === "INVOICES" && (
            <ModuleDetailsSection className="animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                <h2 className="text-lg font-medium text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-zinc-400" />
                  Financial Records & Invoices
                </h2>
              </div>
              <InvoicesTable 
                data={{
                  invoices: invoices,
                  total: invoices.length,
                  totalPages: 1,
                  page: 1
                }} 
                clients={clientsForTable}
                projects={projects}
              />
            </ModuleDetailsSection>
          )}

          {/* COMMUNICATION TAB */}
          {activeTab === "COMMUNICATION" && (
            <ModuleDetailsSection className="animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                <h2 className="text-lg font-medium text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-zinc-400" />
                  Client Communication History
                </h2>
              </div>
              <WhatsAppConversationWidget clientId={clientId} />
            </ModuleDetailsSection>
          )}

          {/* STRATEGY TAB */}
          {activeTab === "STRATEGY" && (
            <StrategyModule clientId={clientId} initialData={strategy} />
          )}

          {/* CONTENT CALENDAR TAB */}
          {activeTab === "CONTENT_CALENDAR" && (
            <CalendarModule clientId={clientId} events={calendarEvents} />
          )}

          {/* ANALYTICS & PUBLISHING TAB */}
          {activeTab === "ANALYTICS_PUBLISHING" && (
            <AnalyticsModule clientId={clientId} metrics={contentMetrics} />
          )}

          </div>
        </div>
      </ModuleDetailsBody>
    </ModuleDetailsLayout>
  );
}
