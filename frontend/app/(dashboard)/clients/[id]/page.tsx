import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { getClient } from "@/app/actions/client";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getProjects } from "@/app/actions/project";
import { projectConfig } from "@/components/projects/project-config";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Mail, Phone, MapPin, Globe, AtSign, Clock, Building, Plus, FileText, CheckCircle, CreditCard, Camera, MessageCircle } from "lucide-react";
import Link from "next/link";
import { 
  ModuleDetailsLayout, 
  ModuleDetailsHeader, 
  ModuleDetailsBody, 
  ModuleDetailsContent, 
  ModuleDetailsSidebar,
  ModuleDetailsSection
} from "@/components/ui/module";

import { getShoots } from "@/app/actions/shoot";
import { format, formatDistanceToNow } from "date-fns";
import ShootTable from "@/components/shoots/shoot-table";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { whatsappLinks } from "@/lib/integrations/whatsapp";
import { updateClientPhone } from "@/app/actions/client";
import ClientDriveWidget from "@/components/clients/client-drive-widget";
import { WhatsAppConversationWidget } from "@/components/shared/whatsapp-conversation-widget";
import { ClientWorkspaceWidget } from "@/components/clients/client-workspace-widget";

export const dynamic = "force-dynamic";

export default async function ClientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const clientData = await getClient(resolvedParams.id);
  const client = clientData as any;
  const [projectData, shootData, clients, projects, invoicesData, paymentsData, expensesData] = await Promise.all([
    getProjects({ clientId: resolvedParams.id, limit: 100 }),
    getShoots({ clientId: resolvedParams.id, limit: 100 }),
    prisma.client.findMany({ select: { id: true, businessName: true }, orderBy: { businessName: 'asc' }, where: { archivedAt: null } }),
    prisma.project.findMany({ select: { id: true, title: true, clientId: true }, orderBy: { title: 'asc' }, where: { archivedAt: null } }),
    prisma.invoice.findMany({ where: { clientId: resolvedParams.id }, orderBy: { issueDate: 'desc' }, include: { project: { select: { title: true } } } }),
    prisma.payment.findMany({ where: { clientId: resolvedParams.id }, orderBy: { paymentDate: 'desc' } }),
    prisma.expense.findMany({ where: { clientId: resolvedParams.id }, orderBy: { date: 'desc' } })
  ]);

  if (!client) {
    notFound();
  }

  // Format full address
  const fullAddress = [client.address, client.city, client.state, client.country, client.postalCode]
    .filter(Boolean)
    .join(", ");

  return (
    <ModuleDetailsLayout>
      <Link href="/clients">
        <Button variant="ghost" className="w-fit text-zinc-400 hover:text-white p-0 h-auto">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Clients
        </Button>
      </Link>
      
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-white tracking-tight">{client.businessName}</span>
            <Badge variant="outline" className="bg-white/5 text-zinc-300 font-mono text-xs">
              {client.clientCode}
            </Badge>
          </div>
        }
        subtitle={client.contactPerson && <span className="text-sm text-zinc-400">{client.contactPerson}</span>}
        action={
          <div className="flex items-center gap-3">
            <WhatsAppButton 
              variant="outline" 
              className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 h-8 text-sm px-3"
              phone={client.phone}
              onSavePhone={async (phone) => {
                "use server";
                return updateClientPhone(client.id, phone);
              }}
              whatsappTemplate="generalMessage"
              whatsappArgs={[`Hi ${client.contactPerson || client.businessName},\n\n`]}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </WhatsAppButton>
            <Badge className={client.archivedAt ? "bg-red-500/20 text-red-500" : "bg-emerald-500/20 text-emerald-500"}>
              {client.archivedAt ? "Archived" : "Active"}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {client.businessType.replace(/_/g, " ").toLowerCase()}
            </Badge>
          </div>
        }
      />

      <ModuleDetailsBody>
        <ModuleDetailsContent className="space-y-6">
          <ModuleDetailsSection>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-white text-lg font-medium">Contact Information</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-zinc-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-zinc-500">Email</p>
                    <p className="text-white">{client.email || "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-zinc-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-zinc-500">Phone</p>
                    <p className="text-white">{client.phone || "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-zinc-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-zinc-500">Website</p>
                    <p className="text-white">
                      {client.website ? (
                        <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-[#C1121F] hover:underline">
                          {client.website}
                        </a>
                      ) : "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AtSign className="w-5 h-5 text-zinc-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-zinc-500">Instagram</p>
                    <p className="text-white">{client.instagram || "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 md:col-span-2">
                  <MapPin className="w-5 h-5 text-zinc-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-zinc-500">Address</p>
                    <p className="text-white">{fullAddress || "—"}</p>
                  </div>
                </div>
                {client.gstNumber && (
                  <div className="flex items-start gap-3 md:col-span-2">
                    <Building className="w-5 h-5 text-zinc-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-zinc-500">GST Number</p>
                      <p className="text-white">{client.gstNumber}</p>
                    </div>
                  </div>
                )}
              </div>
            </ModuleDetailsSection>

            <div className="grid grid-cols-1 gap-6">
              <ModuleDetailsSection>
                <div className="flex flex-row items-center justify-between pb-4 border-b border-white/10 mb-4">
                  <div className="text-white text-lg flex items-center gap-2 font-medium">
                    <CheckCircle className="w-5 h-5 text-zinc-400" />
                    Projects ({projectData.total})
                  </div>
                  <Link href={`/projects?new=true&clientId=${client.id}`} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-3 bg-[#C1121F] hover:bg-[#a00f1a] text-white">
                    <Plus className="w-4 h-4 mr-2" /> New Project
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(projectData.projects as any[]).map(p => (
                    <div key={p.id}>{projectConfig.cardRender(p)}</div>
                  ))}
                  {projectData.projects.length === 0 && (
                    <p className="text-zinc-500 text-sm">No projects found.</p>
                  )}
                </div>
              </ModuleDetailsSection>

              <ModuleDetailsSection>
                <div className="flex flex-row items-center justify-between pb-4 border-b border-white/10 mb-4">
                  <div className="text-white text-lg flex items-center gap-2 font-medium">
                    <Camera className="w-5 h-5 text-zinc-400" />
                    Shoots ({shootData.total})
                  </div>
                  <Link href={`/shoots?new=true&clientId=${client.id}`} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-3 bg-[#C1121F] hover:bg-[#a00f1a] text-white">
                    <Plus className="w-4 h-4 mr-2" /> Schedule Shoot
                  </Link>
                </div>
                  <ShootTable 
                    shoots={shootData.shoots as any} 
                    clients={clients} 
                    projects={projects}
                    total={shootData.total}
                  />
              </ModuleDetailsSection>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ModuleDetailsSection>
                  <div className="flex flex-row items-center justify-between mb-4">
                    <div className="text-white text-lg flex items-center gap-2 font-medium">
                      <FileText className="w-5 h-5 text-zinc-400" />
                      Invoices
                    </div>
                  </div>
                  <div className="space-y-3">
                  {invoicesData.length === 0 ? (
                    <p className="text-zinc-500 text-sm">No invoices generated.</p>
                  ) : (
                    invoicesData.slice(0, 5).map(inv => (
                      <Link key={inv.id} href={`/finance/invoices/${inv.id}`} className="flex justify-between items-center p-2 rounded-md hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                        <div>
                          <p className="text-white text-sm font-medium">{inv.invoiceNumber}</p>
                          <p className="text-zinc-500 text-xs">{inv.project?.title || "No Project"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white text-sm font-semibold">₹{Number(inv.total).toLocaleString()}</p>
                          <Badge variant="outline" className={`text-[10px] mt-1 ${inv.status === 'PAID' ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-400 bg-zinc-500/10'}`}>
                            {inv.status}
                          </Badge>
                        </div>
                      </Link>
                    ))
                  )}
                  {invoicesData.length > 5 && (
                    <Link href={`/finance/invoices?clientId=${client.id}`} className="block text-center text-sm text-[#C1121F] hover:text-white mt-2">
                      View all {invoicesData.length} invoices
                    </Link>
                  )}
                  </div>
                </ModuleDetailsSection>

                <ModuleDetailsSection>
                  <div className="flex flex-row items-center justify-between mb-4">
                    <div className="text-white text-lg flex items-center gap-2 font-medium">
                      <CreditCard className="w-5 h-5 text-zinc-400" />
                      Finances Summary
                    </div>
                  </div>
                  <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-zinc-400 text-sm">Total Invoiced</span>
                    <span className="text-white font-medium">₹{invoicesData.reduce((s, i) => s + Number(i.total), 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2 pt-2">
                    <span className="text-zinc-400 text-sm">Total Revenue (Paid)</span>
                    <span className="text-emerald-400 font-medium">₹{paymentsData.reduce((s, p) => s + Number(p.amount), 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2 pt-2">
                    <span className="text-zinc-400 text-sm">Total Expenses</span>
                    <span className="text-red-400 font-medium">₹{expensesData.reduce((s, e) => s + Number(e.amount), 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2 pt-2">
                    <span className="text-zinc-400 text-sm">Net Profit</span>
                    <span className={`font-bold ${paymentsData.reduce((s, p) => s + Number(p.amount), 0) - expensesData.reduce((s, e) => s + Number(e.amount), 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      ₹{(paymentsData.reduce((s, p) => s + Number(p.amount), 0) - expensesData.reduce((s, e) => s + Number(e.amount), 0)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <Link href={`/finance?clientId=${client.id}`} className="text-sm text-[#C1121F] hover:text-white">
                      Go to Finance Dashboard
                    </Link>
                  </div>
                  </div>
                </ModuleDetailsSection>
              </div>
            </div>
            
            <ModuleDetailsSection className="mt-6">
              <div className="text-white text-lg font-medium mb-4">Activity Timeline</div>
              <ActivityTimeline activities={client.activities || []} />
            </ModuleDetailsSection>
        </ModuleDetailsContent>

        <ModuleDetailsSidebar className="space-y-6">
          <ModuleDetailsSection>
            <div className="text-white text-lg font-medium mb-4">Client Profile</div>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 flex items-center gap-2"><Clock className="w-4 h-4"/> Client Since</span>
                  <span className="text-white text-sm">{new Date(client.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
          </ModuleDetailsSection>

          <ModuleDetailsSection>
            <ClientWorkspaceWidget
              clientId={client.id}
              email={client.email}
              phone={client.phone}
              businessName={client.businessName}
              driveUrl={client.driveFolderUrl}
            />
          </ModuleDetailsSection>

          <ModuleDetailsSection>
            <div className="text-white text-lg font-medium mb-4">WhatsApp Cloud API</div>
            <WhatsAppConversationWidget
              clientId={client.id}
              phone={client.phone}
              recipientName={client.contactPerson || client.businessName}
            />
          </ModuleDetailsSection>

          <ModuleDetailsSection>
            <div className="text-white text-lg font-medium mb-4">Google Drive Integration</div>
            <ClientDriveWidget 
              clientId={client.id} 
              driveFolderId={client.driveFolderId} 
              driveFolderUrl={client.driveFolderUrl} 
            />
          </ModuleDetailsSection>

          <ModuleDetailsSection>
            <div className="text-white text-lg font-medium mb-4">Internal Notes</div>
            <p className="text-zinc-300 whitespace-pre-wrap text-sm">
              {client.notes || "No internal notes for this client."}
            </p>
          </ModuleDetailsSection>
        </ModuleDetailsSidebar>
      </ModuleDetailsBody>
    </ModuleDetailsLayout>
  );
}
