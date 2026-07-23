import React from "react";
import Topbar from "@/components/dashboard/topbar";
import { getClient } from "@/app/actions/client";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getProjects } from "@/app/actions/project";
import ProjectCardGrid from "@/components/projects/project-card-grid";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Mail, Phone, MapPin, Globe, AtSign, Clock, Building, Plus, FileText, CheckCircle, CreditCard, Camera, MessageCircle } from "lucide-react";
import Link from "next/link";

import { getShoots } from "@/app/actions/shoot";
import { format, formatDistanceToNow } from "date-fns";
import ShootTable from "@/components/shoots/shoot-table";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { whatsappLinks } from "@/lib/integrations/whatsapp";
import { updateClientPhone } from "@/app/actions/client";

export const dynamic = "force-dynamic";

export default async function ClientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const [client, projectData, shootData, clients, projects, invoicesData, paymentsData, expensesData] = await Promise.all([
    getClient(resolvedParams.id),
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
    <>
      <Topbar title="Client Details" />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#050505]">
        <div className="mb-6 flex flex-col gap-4">
          <Link href="/clients">
            <Button variant="ghost" className="w-fit text-zinc-400 hover:text-white p-0 h-auto">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Clients
            </Button>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold text-white tracking-tight">{client.businessName}</h2>
                <Badge variant="outline" className="bg-white/5 text-zinc-300 font-mono">
                  {client.clientCode}
                </Badge>
              </div>
              {client.contactPerson && <p className="text-lg text-zinc-400 mt-1">{client.contactPerson}</p>}
            </div>
            <div className="flex items-center gap-3">
              <WhatsAppButton 
                variant="outline" 
                className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 h-7 text-xs px-3 py-0"
                phone={client.phone}
                onSavePhone={async (phone) => {
                  return updateClientPhone(client.id, phone);
                }}
                getMessageUrl={(phone) => whatsappLinks.generalMessage(phone, `Hi ${client.contactPerson || client.businessName},\n\n`)}
              >
                <MessageCircle className="w-3 h-3 mr-1.5" />
                WhatsApp
              </WhatsAppButton>
              <Badge className={client.archivedAt ? "bg-red-500/20 text-red-500" : "bg-emerald-500/20 text-emerald-500"}>
                {client.archivedAt ? "Archived" : "Active"}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {client.businessType.replace(/_/g, " ").toLowerCase()}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Info & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-white/10 bg-white/5 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6">
              <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/10 mb-4">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-zinc-400" />
                    Projects ({projectData.total})
                  </CardTitle>
                  <Link href={`/projects?new=true&clientId=${client.id}`} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-3 bg-[#C1121F] hover:bg-[#a00f1a] text-white">
                    <Plus className="w-4 h-4 mr-2" /> New Project
                  </Link>
                </CardHeader>
                <CardContent>
                  <ProjectCardGrid 
                    projects={projectData.projects as any} 
                    clients={[{ id: client.id, businessName: client.businessName }]} 
                    total={projectData.total}
                  />
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/10 mb-4">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Camera className="w-5 h-5 text-zinc-400" />
                    Shoots ({shootData.total})
                  </CardTitle>
                  <Link href={`/shoots?new=true&clientId=${client.id}`} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-3 bg-[#C1121F] hover:bg-[#a00f1a] text-white">
                    <Plus className="w-4 h-4 mr-2" /> Schedule Shoot
                  </Link>
                </CardHeader>
                <CardContent>
                  <ShootTable 
                    shoots={shootData.shoots as any} 
                    clients={clients} 
                    projects={projects}
                    total={shootData.total}
                  />
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-zinc-400" />
                    Invoices
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
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
                          <p className="text-white text-sm font-semibold">${Number(inv.total).toLocaleString()}</p>
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
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-zinc-400" />
                    Finances Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-zinc-400 text-sm">Total Invoiced</span>
                    <span className="text-white font-medium">${invoicesData.reduce((s, i) => s + Number(i.total), 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2 pt-2">
                    <span className="text-zinc-400 text-sm">Total Revenue (Paid)</span>
                    <span className="text-emerald-400 font-medium">${paymentsData.reduce((s, p) => s + Number(p.amount), 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2 pt-2">
                    <span className="text-zinc-400 text-sm">Total Expenses</span>
                    <span className="text-red-400 font-medium">${expensesData.reduce((s, e) => s + Number(e.amount), 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2 pt-2">
                    <span className="text-zinc-400 text-sm">Net Profit</span>
                    <span className={`font-bold ${paymentsData.reduce((s, p) => s + Number(p.amount), 0) - expensesData.reduce((s, e) => s + Number(e.amount), 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      ${(paymentsData.reduce((s, p) => s + Number(p.amount), 0) - expensesData.reduce((s, e) => s + Number(e.amount), 0)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <Link href={`/finance?clientId=${client.id}`} className="text-sm text-[#C1121F] hover:text-white">
                      Go to Finance Dashboard
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            </div>
            
            <Card className="border-white/10 bg-white/5 backdrop-blur-md mt-6">
              <CardHeader>
                <CardTitle className="text-white text-lg">Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityTimeline activities={client.activities || []} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Meta & Notes */}
          <div className="space-y-6">
            <Card className="border-white/10 bg-white/5 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white text-lg">Client Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 flex items-center gap-2"><Clock className="w-4 h-4"/> Client Since</span>
                  <span className="text-white text-sm">{new Date(client.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/5 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white text-lg">Internal Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-300 whitespace-pre-wrap text-sm">
                  {client.notes || "No notes available for this client."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
