import React from "react";
import Topbar from "@/components/dashboard/topbar";
import { getProject } from "@/app/actions/project";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Building, Plus, FileText, CheckCircle, CreditCard, Camera, Info, Calendar, IndianRupee, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getShoots } from "@/app/actions/shoot";
import ShootTable from "@/components/shoots/shoot-table";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import ProjectDriveButton from "@/components/projects/project-drive-button";
import { whatsappLinks } from "@/lib/integrations/whatsapp";

export const dynamic = "force-dynamic";

export default async function ProjectDetailsPage({ params }: { params: { id: string } }) {
  const [project, shootData, clients, projects, invoicesData] = await Promise.all([
    getProject(params.id),
    getShoots({ projectId: params.id, limit: 100 }),
    prisma.client.findMany({ select: { id: true, businessName: true }, orderBy: { businessName: 'asc' }, where: { archivedAt: null } }),
    prisma.project.findMany({ select: { id: true, title: true, clientId: true }, orderBy: { title: 'asc' }, where: { archivedAt: null } }),
    prisma.invoice.findMany({ where: { projectId: params.id }, orderBy: { issueDate: 'desc' } })
  ]);

  if (!project) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'INQUIRY': return 'bg-zinc-500/20 text-zinc-400';
      case 'PLANNED': return 'bg-blue-500/20 text-blue-400';
      case 'SHOOTING': return 'bg-purple-500/20 text-purple-400';
      case 'EDITING': return 'bg-amber-500/20 text-amber-400';
      case 'REVIEW': return 'bg-orange-500/20 text-orange-400';
      case 'DELIVERED': return 'bg-emerald-500/20 text-emerald-400';
      case 'COMPLETED': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50';
      case 'CANCELLED': return 'bg-red-500/20 text-red-400';
      default: return 'bg-zinc-500/20 text-zinc-400';
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-red-400';
      case 'PARTIAL': return 'text-amber-400';
      case 'PAID': return 'text-emerald-400';
      default: return 'text-zinc-400';
    }
  };

  return (
    <>
      <Topbar title="Project Details" />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#050505]">
        <div className="mb-6 flex flex-col gap-4">
          <Link href="/projects">
            <Button variant="ghost" className="w-fit text-zinc-400 hover:text-white p-0 h-auto">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Badge variant="outline" className="bg-white/5 text-zinc-300 font-mono text-xs">
                  {project.projectCode}
                </Badge>
                <Badge variant="outline" className={`border-0 ${getStatusColor(project.status)} text-xs`}>
                  {project.status.replace(/_/g, " ")}
                </Badge>
                <Badge variant="outline" className="border-white/10 text-zinc-300 text-xs">
                  {project.category.replace(/_/g, " ").toLowerCase()}
                </Badge>
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">{project.title}</h2>
              <div className="flex items-center text-zinc-400 mt-2 hover:text-white transition-colors w-fit">
                <Link href={`/clients/${project.clientId}`} className="flex items-center gap-1.5">
                  <Building className="w-4 h-4" />
                  {project.client.businessName}
                </Link>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ProjectDriveButton 
                projectId={project.id} 
                googleDriveFolderId={project.googleDriveFolderId} 
                googleDriveLink={project.googleDriveLink} 
              />
              
              {project.client.phone && (
                <a 
                  href={whatsappLinks.generalMessage(project.client.phone, `Hi ${project.client.contactPerson || project.client.businessName},\n\nRegarding the project "${project.title}":\n\n`)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 gap-2">
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp Client
                  </Button>
                </a>
              )}

              <div className={`px-4 py-2 rounded-lg bg-black/40 border border-white/10 flex items-center gap-2 ${getPaymentColor(project.paymentStatus)}`}>
                <IndianRupee className="w-4 h-4" />
                <span className="font-semibold text-lg">{Number(project.totalAmount || 0).toLocaleString('en-IN')}</span>
                <Badge variant="outline" className="ml-1 text-[10px] uppercase border-current bg-transparent">
                  {project.paymentStatus}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Info & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-white/10 bg-white/5 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Info className="w-5 h-5 text-zinc-400" /> Project Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-zinc-500 mb-1">Description</h4>
                  <p className="text-zinc-300 text-sm whitespace-pre-wrap">{project.description || "No description provided."}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <h4 className="text-sm font-medium text-zinc-500 mb-1 flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/> Start Date</h4>
                    <p className="text-white">{project.startDate ? new Date(project.startDate).toLocaleDateString() : "—"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-zinc-500 mb-1 flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/> End Date</h4>
                    <p className="text-white">{project.endDate ? new Date(project.endDate).toLocaleDateString() : "—"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-zinc-500 mb-1 flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-500"/> Delivery Date</h4>
                    <p className="text-amber-500 font-medium">{project.deliveryDate ? new Date(project.deliveryDate).toLocaleDateString() : "—"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6">
              <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/10 mb-4">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Camera className="w-5 h-5 text-zinc-400" />
                    Shoots ({shootData.total})
                  </CardTitle>
                  <Link href={`/shoots?new=true&projectId=${project.id}`} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-3 bg-[#C1121F] hover:bg-[#a00f1a] text-white">
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
                    <CheckCircle className="w-5 h-5 text-zinc-400" />
                    Deliverables
                  </CardTitle>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:text-white">
                    <Plus className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-500 text-sm">No deliverables assigned yet.</p>
                </CardContent>
              </Card>
            </div>
          </div>
            
          <Card className="border-white/10 bg-white/5 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-zinc-400" /> Activity Timeline
                </CardTitle>
                <Button size="sm" variant="outline" className="h-8 bg-zinc-900 border-white/10 text-white">
                  <Plus className="w-4 h-4 mr-2" /> Log Activity
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-500 text-center py-8">Timeline tracking will be integrated in future phases.</p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Meta & Finances */}
          <div className="space-y-6">
            <Card className="border-white/10 bg-white/5 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-zinc-400" /> Finances
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-zinc-400 text-sm">Quotation Amount</span>
                  <span className="text-white">₹{Number(project.quotationAmount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-zinc-400 text-sm">Total Amount</span>
                  <span className="text-white">₹{Number(project.totalAmount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-emerald-400 text-sm">Advance Received</span>
                  <span className="text-emerald-400 font-medium">₹{Number(project.advanceAmount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-red-400 text-sm font-medium">Balance Due</span>
                  <span className="text-red-400 font-bold text-lg">₹{Number(project.balanceAmount || 0).toLocaleString('en-IN')}</span>
                </div>
              </CardContent>
            </Card>
            
              <Card className="border-white/10 bg-white/5 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/10 mb-4">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-zinc-400" />
                  Invoices
                </CardTitle>
                <Link href={`/finance/invoices?projectId=${project.id}`} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 px-2 bg-[#C1121F] hover:bg-[#a00f1a] text-white">
                  <Plus className="w-3 h-3 mr-1" /> New
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                  {invoicesData.length === 0 ? (
                    <p className="text-zinc-500 text-sm">No invoices generated.</p>
                  ) : (
                    invoicesData.slice(0, 5).map(inv => (
                      <Link key={inv.id} href={`/finance/invoices/${inv.id}`} className="flex justify-between items-center p-2 rounded-md hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                        <div>
                          <p className="text-white text-sm font-medium">{inv.invoiceNumber}</p>
                          <p className="text-zinc-500 text-[10px]">{new Date(inv.issueDate).toLocaleDateString()}</p>
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
                    <Link href={`/finance/invoices?projectId=${project.id}`} className="block text-center text-sm text-[#C1121F] hover:text-white mt-2">
                      View all invoices
                    </Link>
                  )}
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/5 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white text-lg">Internal Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-300 whitespace-pre-wrap text-sm">
                  {project.notes || "No notes available for this project."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
