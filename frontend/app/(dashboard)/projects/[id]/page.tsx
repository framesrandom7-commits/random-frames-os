import React from "react";
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
      
      <ModuleDetailsHeader>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl font-bold text-white tracking-tight">{project.title}</span>
            <Badge variant="outline" className="bg-white/5 text-zinc-300 font-mono text-xs">
              {project.projectCode}
            </Badge>
            <Badge variant="outline" className={`border-0 ${getStatusColor(project.status)} text-xs`}>
              {project.status.replace(/_/g, " ")}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-lg text-zinc-400">
            <Building className="w-4 h-4" />
            <Link href={`/clients/${project.client.id}`} className="hover:text-white hover:underline transition-colors">
              {project.client.businessName}
            </Link>
          </div>
        </div>
        
        <div className="flex items-center gap-3 mt-4 md:mt-0 flex-wrap justify-end">
          <WhatsAppButton 
            variant="outline" 
            className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 h-9"
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

          <div className={`px-4 py-1.5 rounded-lg bg-black/40 border border-white/10 flex items-center gap-2 ${getPaymentColor(project.paymentStatus)}`}>
            <IndianRupee className="w-4 h-4" />
            <span className="font-semibold text-lg">{Number(project.totalAmount || 0).toLocaleString('en-IN')}</span>
            <Badge variant="outline" className="ml-1 text-[10px] uppercase border-current bg-transparent">
              {project.paymentStatus}
            </Badge>
          </div>
        </div>
      </ModuleDetailsHeader>

      <ModuleDetailsBody>
        <ModuleDetailsContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-white/5 border border-white/10 p-1 w-fit mb-4">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">Overview</TabsTrigger>
              <TabsTrigger value="storage" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">Storage & Files</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="flex flex-col gap-6 m-0">
              <ModuleDetailsSection>
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                  <Info className="w-5 h-5 text-zinc-400" />
                  <span className="text-white text-lg font-medium">Project Details</span>
                </div>
                <div className="space-y-4">
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
                      <h4 className="text-sm font-medium text-zinc-500 mb-1 flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/> Due Date</h4>
                      <p className="text-white">{project.endDate ? new Date(project.endDate).toLocaleDateString() : "—"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-zinc-500 mb-1 flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-500"/> Delivery Date</h4>
                      <p className="text-amber-500 font-medium">{project.deliveryDate ? new Date(project.deliveryDate).toLocaleDateString() : "—"}</p>
                    </div>
                  </div>
                </div>
              </ModuleDetailsSection>

              <ModuleDetailsSection>
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-zinc-400" />
                    <span className="text-white text-lg font-medium">Shoots ({shootData.total})</span>
                  </div>
                  <Link href={`/shoots?new=true&projectId=${project.id}`} className="inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-medium bg-[#C1121F] hover:bg-[#a00f1a] text-white transition-colors">
                    <Plus className="w-4 h-4 mr-2" /> Schedule Shoot
                  </Link>
                </div>
                <div className="-mx-4 sm:mx-0">
                  <ShootTable 
                    shoots={shootData.shoots as any} 
                    clients={clients} 
                    projects={projects}
                    total={shootData.total}
                  />
                </div>
              </ModuleDetailsSection>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ModuleDetailsSection>
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                    <CheckCircle className="w-5 h-5 text-zinc-400" />
                    <span className="text-white text-lg font-medium">Deliverables</span>
                  </div>
                  <p className="text-zinc-500 text-sm">No deliverables assigned yet. (Managed via Shoots)</p>
                </ModuleDetailsSection>
                <ModuleDetailsSection>
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                    <FileText className="w-5 h-5 text-zinc-400" />
                    <span className="text-white text-lg font-medium">Internal Notes</span>
                  </div>
                  <p className="text-zinc-300 text-sm whitespace-pre-wrap">{project.notes || "No internal notes."}</p>
                </ModuleDetailsSection>
              </div>
            </TabsContent>

            <TabsContent value="storage" className="m-0">
              <ModuleDetailsSection>
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                  <Folder className="w-5 h-5 text-zinc-400" />
                  <span className="text-white text-lg font-medium">Project Storage</span>
                </div>
                <ProjectStorageTab 
                  project={project as any} 
                />
              </ModuleDetailsSection>
            </TabsContent>
          </Tabs>
        </ModuleDetailsContent>

        <ModuleDetailsSidebar>
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
             <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
              <IndianRupee className="w-5 h-5 text-zinc-400" />
              <span className="text-white text-lg font-medium">Financials</span>
             </div>
             <div className="space-y-4">
               <div className="flex justify-between items-center text-sm">
                 <span className="text-zinc-500">Quotation</span>
                 <span className="text-white font-medium">₹{Number(project.quotationAmount || 0).toLocaleString('en-IN')}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-zinc-500">Total Billed</span>
                 <span className="text-white font-medium">₹{Number(project.totalAmount || 0).toLocaleString('en-IN')}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-zinc-500">Advance Paid</span>
                 <span className="text-emerald-400 font-medium">₹{Number(project.advanceAmount || 0).toLocaleString('en-IN')}</span>
               </div>
               <div className="flex justify-between items-center text-sm font-medium pt-2 border-t border-white/10">
                 <span className="text-zinc-400">Balance Due</span>
                 <span className="text-red-400">₹{Number(project.balanceAmount || 0).toLocaleString('en-IN')}</span>
               </div>
             </div>
             <div className="mt-4">
                <Link href={`/invoices?projectId=${project.id}`} className="w-full inline-flex h-9 items-center justify-center rounded-md border border-white/10 bg-transparent text-sm font-medium hover:bg-white/5 transition-colors">
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
              <Clock className="w-5 h-5 text-zinc-400" />
              <span className="text-white text-lg font-medium">Timeline</span>
            </div>
            <div className="h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <ActivityTimeline activities={project.activities || []} />
            </div>
          </ModuleDetailsSection>
        </ModuleDetailsSidebar>
      </ModuleDetailsBody>
    </ModuleDetailsLayout>
  );
}
