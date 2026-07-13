import React, { Suspense } from "react";
import Topbar from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { FolderPlus, Camera, Clock, CheckCircle2, AlertCircle, IndianRupee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProjects, getProjectStats } from "@/app/actions/project";
import { prisma } from "@/lib/prisma";
import ProjectTable from "@/components/projects/project-table";
import ProjectCardGrid from "@/components/projects/project-card-grid";
import ProjectSearch from "@/components/projects/project-search";
import ProjectFilters from "@/components/projects/project-filters";
import ProjectViewToggle from "@/components/projects/project-view-toggle";
import { ProjectStatus, ProjectPriority, PaymentStatus } from "@prisma/client";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page) : 1;
  const search = typeof searchParams.search === "string" ? searchParams.search : "";
  const status = typeof searchParams.status === "string" ? searchParams.status as ProjectStatus : "";
  const priority = typeof searchParams.priority === "string" ? searchParams.priority as ProjectPriority : "";
  const paymentStatus = typeof searchParams.paymentStatus === "string" ? searchParams.paymentStatus as PaymentStatus : "";
  const archived = searchParams.archived === "true";
  const sortBy = typeof searchParams.sortBy === "string" ? searchParams.sortBy : "createdAt";
  const sortOrder = searchParams.sortOrder === "asc" ? "asc" : "desc";
  const view = typeof searchParams.view === "string" ? searchParams.view : "grid";

  // Fetch projects and stats concurrently
  const [projectData, stats, allClients] = await Promise.all([
    getProjects({ page, limit: 50, search, status, priority, paymentStatus, archived, sortBy, sortOrder }),
    getProjectStats(),
    prisma.client.findMany({ select: { id: true, businessName: true }, orderBy: { businessName: 'asc' }, where: { archivedAt: null } })
  ]);

  return (
    <>
      <Topbar title="Projects" />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#050505]">
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <Card className="border-white/10 bg-white/5 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-zinc-400">Active Projects</CardTitle>
              <FolderPlus className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.activeProjects}</div>
            </CardContent>
          </Card>
          
          <Card className="border-white/10 bg-white/5 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-zinc-400">Upcoming Shoots</CardTitle>
              <Camera className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">{stats.upcomingShoots}</div>
            </CardContent>
          </Card>
          
          <Card className="border-white/10 bg-white/5 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-zinc-400">In Editing</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">{stats.editingProjects}</div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-zinc-400">Delivered</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-500">{stats.deliveredProjects}</div>
            </CardContent>
          </Card>
          
          <Card className="border-white/10 bg-white/5 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-zinc-400">Overdue Deliveries</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.overdueDeliveries}</div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-zinc-400">Revenue Pipeline</CardTitle>
              <IndianRupee className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-emerald-400">₹{stats.revenueInProgress.toLocaleString('en-IN')}</div>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-1 items-center gap-2">
            <ProjectSearch />
            <ProjectFilters />
            <div className="hidden sm:block ml-2">
              <ProjectViewToggle />
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="sm:hidden block">
              <ProjectViewToggle />
            </div>
            {/* The primary creation button will just open the form handled inside the list views if length is 0, but since we want a top level button we can create a client wrapper for the 'Create Project' button or handle it natively.
                For simplicity, we'll embed the form inside the views and rely on that. Alternatively, we create a small wrapper.
                I'll create a simple wrapper or use a trick. */}
            <Link href={`?new=true`} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-[#C1121F] text-white hover:bg-[#a00f1a] shadow-lg w-full sm:w-auto">
               <FolderPlus className="mr-2 h-4 w-4" /> New Project
            </Link>
          </div>
        </div>

        {/* Content View */}
        <Suspense fallback={<div className="h-96 flex items-center justify-center text-zinc-500">Loading projects...</div>}>
          {view === "table" ? (
            <ProjectTable 
              projects={projectData.projects as any} 
              clients={allClients}
              page={projectData.currentPage} 
              totalPages={projectData.totalPages} 
              total={projectData.total} 
            />
          ) : (
            <ProjectCardGrid 
              projects={projectData.projects as any} 
              clients={allClients}
              page={projectData.currentPage} 
              totalPages={projectData.totalPages} 
              total={projectData.total} 
            />
          )}
        </Suspense>
      </main>
    </>
  );
}
