"use client";

import React, { useState, useTransition } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderPlus, Edit, Trash2, Calendar, IndianRupee, Copy, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Project, Client } from "@prisma/client";
import { deleteProject, duplicateProject } from "@/app/actions/project";
import ProjectForm from "./project-form";
import { Badge } from "@/components/ui/badge";

interface ProjectWithClient extends Project {
  client: Client;
}

interface ProjectCardGridProps {
  projects: ProjectWithClient[];
  clients: { id: string; businessName: string }[];
  page?: number;
  totalPages?: number;
  total?: number;
}

export default function ProjectCardGrid({ projects, clients, page = 1, totalPages = 1, total = 0 }: ProjectCardGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [open, setOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);

  const isArchived = searchParams.get("archived") === "true";

  const handleEdit = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setEditingProject(project);
    setOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to archive this project?")) {
      startTransition(async () => {
        const success = await deleteProject(id);
        if (success) {
          toast.success("Project archived successfully");
        } else {
          toast.error("Failed to archive project");
        }
      });
    }
  };

  const handleDuplicate = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    startTransition(async () => {
      const result = await duplicateProject(id);
      if (result.success) {
        toast.success("Project duplicated successfully");
      } else {
        toast.error("Failed to duplicate project");
      }
    });
  };

  const handleCardClick = (id: string) => {
    router.push(`/projects/${id}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  if (projects.length === 0) {
    return (
      <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
        <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
          <div className="h-24 w-24 rounded-full bg-white/5 flex items-center justify-center mb-6 ring-1 ring-white/10">
            <FolderPlus className="h-10 w-10 text-zinc-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No projects found</h3>
          <p className="text-zinc-400 max-w-sm mb-8">
            {isArchived ? "There are no archived projects." : "Get started by creating your first project."}
          </p>
          {!isArchived && (
            <Button onClick={() => { setEditingProject(undefined); setOpen(true); }} className="bg-[#C1121F] text-white hover:bg-[#a00f1a] px-8 h-11 shadow-lg">
              Create First Project
            </Button>
          )}
          <ProjectForm open={open} onOpenChange={setOpen} project={editingProject} clients={clients} />
        </CardContent>
      </Card>
    );
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-zinc-500/20 text-zinc-400';
      case 'MEDIUM': return 'bg-blue-500/20 text-blue-400';
      case 'HIGH': return 'bg-orange-500/20 text-orange-400';
      case 'URGENT': return 'bg-red-500/20 text-red-400';
      default: return 'bg-zinc-500/20 text-zinc-400';
    }
  };

  return (
    <>
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
        {projects.map((project) => (
          <Card 
            key={project.id} 
            className="border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-colors cursor-pointer group flex flex-col"
            onClick={() => handleCardClick(project.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-xs text-zinc-500">{project.projectCode}</span>
                <Badge variant="outline" className={`border-0 ${getPriorityColor(project.priority)} text-[10px] px-1.5 py-0`}>
                  {project.priority}
                </Badge>
              </div>
              <CardTitle className="text-white text-lg line-clamp-1" title={project.title}>
                {project.title}
              </CardTitle>
              <div className="text-sm text-zinc-400 flex items-center gap-2 mt-1">
                {project.client.businessName}
              </div>
            </CardHeader>
            <CardContent className="flex-1 pb-4">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className={`border-0 ${getStatusColor(project.status)}`}>
                  {project.status.replace(/_/g, " ")}
                </Badge>
                <Badge variant="outline" className="border-white/10 text-zinc-300">
                  {project.category.replace(/_/g, " ").toLowerCase()}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                {(project.startDate || project.deliveryDate) && (
                  <div className="flex items-center text-zinc-400">
                    <Calendar className="w-4 h-4 mr-2 text-zinc-500" />
                    {project.startDate && new Date(project.startDate).toLocaleDateString()} 
                    {project.startDate && project.deliveryDate && " - "} 
                    {project.deliveryDate && new Date(project.deliveryDate).toLocaleDateString()}
                  </div>
                )}
                {project.totalAmount && (
                  <div className="flex items-center text-zinc-400">
                    <IndianRupee className="w-4 h-4 mr-2 text-zinc-500" />
                    {Number(project.totalAmount).toLocaleString('en-IN')}
                    <span className="text-xs ml-2 px-1.5 rounded bg-white/5 text-zinc-500">{project.paymentStatus}</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t border-white/10 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
              {!isArchived && (
                <>
                  <Button variant="ghost" size="icon" onClick={(e) => handleDuplicate(e, project.id)} className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10" title="Duplicate">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={(e) => handleEdit(e, project)} className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10" title="Edit">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={(e) => handleDelete(e, project.id)} className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-500/10" title="Archive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between text-sm text-zinc-400">
          <div>
            Showing <span className="text-white font-medium">{(page - 1) * 50 + 1}</span> to <span className="text-white font-medium">{Math.min(page * 50, total)}</span> of <span className="text-white font-medium">{total}</span> projects
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePageChange(page - 1)} 
              disabled={page <= 1 || isPending}
              className="h-8 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white text-zinc-400"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            <div className="px-2 text-white text-xs font-medium bg-white/10 rounded h-8 flex items-center">
              {page} / {totalPages}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePageChange(page + 1)} 
              disabled={page >= totalPages || isPending}
              className="h-8 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white text-zinc-400"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
      
      <ProjectForm open={open} onOpenChange={setOpen} project={editingProject} clients={clients} />
    </>
  );
}
