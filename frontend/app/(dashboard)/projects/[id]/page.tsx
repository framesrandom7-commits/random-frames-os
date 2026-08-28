import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { getProject } from "@/app/actions/project";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Building, Plus, FileText, CheckCircle, Folder, Camera, Info, Calendar, IndianRupee, MessageCircle, Users, HardDrive } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getShoots } from "@/app/actions/shoot";
import ShootTable from "@/components/shoots/shoot-table";
import { prisma } from "@/lib/prisma";
import ProjectDriveTree from "@/components/projects/project-drive-tree";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectStorageTab from "@/components/projects/project-storage-tab";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { updateClientPhone } from "@/app/actions/client";
import { 
  ModuleDetailsLayout, 
  ModuleDetailsHeader, 
  ModuleDetailsBody, 
  ModuleDetailsContent, 
  ModuleDetailsSidebar,
  ModuleDetailsSection
} from "@/components/ui/module";
import { ProjectWorkspaceWidget } from "@/components/projects/project-workspace-widget";

export const dynamic = "force-dynamic";

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const project = await getProject(resolvedParams.id);
  const [shootData, clients, projects, invoicesData] = await Promise.all([
    getShoots({ projectId: resolvedParams.id, limit: 100 }),
    prisma.client.findMany({ select: { id: true, businessName: true }, orderBy: { businessName: 'asc' }, where: { archivedAt: null } }),
    prisma.project.findMany({ select: { id: true, title: true, clientId: true }, orderBy: { title: 'asc' }, where: { archivedAt: null } }),
    prisma.invoice.findMany({ where: { projectId: resolvedParams.id }, orderBy: { issueDate: 'desc' } })
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
    <ModuleDetailsLayout>
      <Link href="/projects">
        <Button variant="ghost" className="w-fit text-zinc-400 hover:text-white p-0 h-auto">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>
      </Link>
      
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-white tracking-tight">{project.title}</span>
          </div>
        }
      />

      <ModuleDetailsBody>
        <ModuleDetailsContent className="space-y-6">
          <div className="flex flex-row items-center justify-center gap-6 py-3 px-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md overflow-x-auto whitespace-nowrap custom-scrollbar">
            <Link href={`/clients/${project.client.id}`} className="text-sm text-zinc-300 hover:text-white hover:underline transition-colors flex items-center gap-2 font-medium shrink-0">
              <Building className="w-4 h-4 text-zinc-500" />
              {project.client.businessName}
            </Link>

            <span className="text-zinc-700 shrink-0">•</span>

            <WhatsAppButton 
              variant="outline" 
              className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 h-8 text-sm px-3 shrink-0"
              phone={project.client.phone}
              onSavePhone={async (phone) => {
                "use server";
                return updateClientPhone(project.client.id, phone);
              }}
              whatsappTemplate="generalMessage"
              whatsappArgs={[`Hi ${project.client.contactPerson || project.client.businessName},\n\nRegarding the project "${project.title}":\n\n`]}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp Client
            </WhatsAppButton>

            <span className="text-zinc-700 shrink-0">•</span>

            <div className={`px-4 py-1.5 rounded-lg bg-black/40 border border-white/10 flex items-center gap-2 ${getPaymentColor(project.paymentStatus)} shrink-0`}>
              <IndianRupee className="w-4 h-4" />
              <span className="font-semibold text-base">{Number(project.totalAmount || 0).toLocaleString('en-IN')}</span>
              <Badge variant="outline" className="ml-1 text-[10px] uppercase border-current bg-transparent">
                {project.paymentStatus}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <ModuleDetailsSection>
              <div className="flex flex-row items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div className="text-white text-lg flex items-center gap-2 font-medium">
                  <Camera className="w-5 h-5 text-zinc-400" />
                  Shoots ({shootData.total})
                </div>
                <Link href={`/shoots?new=true&projectId=${project.id}`} className="inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-medium bg-[#C1121F] hover:bg-[#a00f1a] text-white transition-colors">
                  <Plus className="w-4 h-4 mr-2" /> Schedule Shoot
                </Link>
              </div>
              <ShootTable 
                shoots={shootData.shoots as any} 
                clients={clients} 
                projects={projects}
                total={shootData.total}
                variant="list"
              />
            </ModuleDetailsSection>

            <ModuleDetailsSection>
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                <Folder className="w-5 h-5 text-zinc-400" />
                <span className="text-white text-lg font-medium">Project Storage</span>
              </div>
              <ProjectStorageTab project={project as any} />
            </ModuleDetailsSection>

            <ModuleDetailsSection>
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                <CheckCircle className="w-5 h-5 text-zinc-400" />
                <span className="text-white text-lg font-medium">Deliverables</span>
              </div>
              <p className="text-zinc-500 text-sm">No deliverables assigned yet. (Managed via Shoots)</p>
            </ModuleDetailsSection>
          </div>

          <ModuleDetailsSection className="mt-6">
            <div className="text-white text-lg font-medium mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-zinc-400" />
              Activity Timeline
            </div>
            <ActivityTimeline activities={project.activities || []} />
          </ModuleDetailsSection>
        </ModuleDetailsContent>

        <ModuleDetailsSidebar className="space-y-6">
          <ModuleDetailsSection>
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
              <Info className="w-5 h-5 text-zinc-400" />
              <span className="text-white text-lg font-medium">Project Details</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-zinc-400 text-sm">Project Code</span>
                <Badge variant="outline" className="bg-white/5 text-zinc-300 font-mono text-[10px]">
                  {project.projectCode}
                </Badge>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-zinc-400 text-sm">Status</span>
                <Badge variant="outline" className={`border-0 ${getStatusColor(project.status)} text-[10px]`}>
                  {project.status.replace(/_/g, " ")}
                </Badge>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-zinc-400 flex items-center gap-2 text-sm"><Calendar className="w-4 h-4"/> Start Date</span>
                <span className="text-white text-sm">{project.startDate ? new Date(project.startDate).toLocaleDateString() : "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 flex items-center gap-2 text-sm"><Calendar className="w-4 h-4"/> Due Date</span>
                <span className="text-white text-sm">{project.endDate ? new Date(project.endDate).toLocaleDateString() : "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-amber-500/70 flex items-center gap-2 text-sm"><Clock className="w-4 h-4"/> Delivery Date</span>
                <span className="text-amber-500 text-sm font-medium">{project.deliveryDate ? new Date(project.deliveryDate).toLocaleDateString() : "—"}</span>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <h4 className="text-sm font-medium text-zinc-400 mb-1">Description</h4>
                <p className="text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">{project.description || "No description provided."}</p>
              </div>
            </div>
          </ModuleDetailsSection>

          <ModuleDetailsSection>
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
              <Users className="w-5 h-5 text-zinc-400" />
              <span className="text-white text-lg font-medium">Team</span>
            </div>
            {project.assignedUsers && project.assignedUsers.length > 0 ? (
              <div className="flex flex-col gap-3">
                {project.assignedUsers.map(user => (
                  <div key={user.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center font-medium text-xs uppercase border border-white/10">
                      {(user.name || user.email).charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">{user.name || user.email}</span>
                      <span className="text-xs text-zinc-500">{user.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">No team members assigned.</p>
            )}
          </ModuleDetailsSection>

          <ModuleDetailsSection>
            <ProjectWorkspaceWidget
              projectId={project.id}
              projectTitle={project.title}
              driveFolderUrl={project.driveRootFolderUrl}
              clientEmail={(project.client as any)?.email}
            />
          </ModuleDetailsSection>

          <ModuleDetailsSection>
             <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
              <IndianRupee className="w-5 h-5 text-zinc-400" />
              <span className="text-white text-lg font-medium">Financials</span>
             </div>
             <div className="space-y-4">
               <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                 <span className="text-zinc-500">Quotation</span>
                 <span className="text-white font-medium">₹{Number(project.quotationAmount || 0).toLocaleString('en-IN')}</span>
               </div>
               <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2 pt-2">
                 <span className="text-zinc-500">Total Billed</span>
                 <span className="text-white font-medium">₹{Number(project.totalAmount || 0).toLocaleString('en-IN')}</span>
               </div>
               <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2 pt-2">
                 <span className="text-zinc-500">Advance Paid</span>
                 <span className="text-emerald-400 font-medium">₹{Number(project.advanceAmount || 0).toLocaleString('en-IN')}</span>
               </div>
               <div className="flex justify-between items-center text-sm font-medium pt-2">
                 <span className="text-zinc-400">Balance Due</span>
                 <span className="text-red-400">₹{Number(project.balanceAmount || 0).toLocaleString('en-IN')}</span>
               </div>
             </div>
             <div className="mt-4 pt-4 border-t border-white/10 text-center">
                <Link href={`/invoices?projectId=${project.id}`} className="text-sm text-[#C1121F] hover:text-white">
                  View Invoices ({invoicesData.length})
                </Link>
             </div>
          </ModuleDetailsSection>

          <ModuleDetailsSection>
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
              <HardDrive className="w-5 h-5 text-zinc-400" />
              <span className="text-white text-lg font-medium">Google Drive Integration</span>
            </div>
            <ProjectDriveTree project={project} />
          </ModuleDetailsSection>
          
          <ModuleDetailsSection>
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
              <FileText className="w-5 h-5 text-zinc-400" />
              <span className="text-white text-lg font-medium">Internal Notes</span>
            </div>
            <p className="text-zinc-300 text-sm whitespace-pre-wrap">{project.notes || "No internal notes."}</p>
          </ModuleDetailsSection>
        </ModuleDetailsSidebar>
      </ModuleDetailsBody>
    </ModuleDetailsLayout>
  );
}
