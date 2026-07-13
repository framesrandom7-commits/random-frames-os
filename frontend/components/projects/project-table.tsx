"use client";

import React, { useState, useTransition } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderPlus, Edit, Trash2, ExternalLink, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Copy, MessageCircle, Eye } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Project, Client } from "@prisma/client";
import { deleteProject, duplicateProject } from "@/app/actions/project";
import ProjectForm from "./project-form";
import { Badge } from "@/components/ui/badge";
import { whatsappLinks } from "@/lib/integrations/whatsapp";

interface ProjectWithClient extends Project {
  client: Client;
}

interface ProjectTableProps {
  projects: ProjectWithClient[];
  clients: { id: string; businessName: string }[];
  page?: number;
  totalPages?: number;
  total?: number;
}

export default function ProjectTable({ projects, clients, page = 1, totalPages = 1, total = 0 }: ProjectTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [open, setOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);

  const isArchived = searchParams.get("archived") === "true";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";

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

  const handleRowClick = (id: string) => {
    router.push(`/projects/${id}`);
  };

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    return params.toString();
  };

  const handleSort = (column: string) => {
    const newOrder = sortBy === column && sortOrder === "asc" ? "desc" : "asc";
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("sortBy", column);
      params.set("sortOrder", newOrder);
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    startTransition(() => {
      router.push(`${pathname}?${createQueryString("page", newPage.toString())}`);
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

  const renderSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === "asc" ? <ArrowUp className="ml-1 h-3 w-3 inline" /> : <ArrowDown className="ml-1 h-3 w-3 inline" />;
  };

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
      <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-lg overflow-hidden relative">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-black/40">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-zinc-400 font-medium whitespace-nowrap cursor-pointer hover:text-white transition-colors w-32" onClick={() => handleSort("projectCode")}>
                  Code {renderSortIcon("projectCode")}
                </TableHead>
                <TableHead className="text-zinc-400 font-medium whitespace-nowrap cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("title")}>
                  Project Title {renderSortIcon("title")}
                </TableHead>
                <TableHead className="text-zinc-400 font-medium whitespace-nowrap">
                  Client
                </TableHead>
                <TableHead className="text-zinc-400 font-medium whitespace-nowrap cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("status")}>
                  Status {renderSortIcon("status")}
                </TableHead>
                <TableHead className="text-zinc-400 font-medium whitespace-nowrap cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("paymentStatus")}>
                  Payment {renderSortIcon("paymentStatus")}
                </TableHead>
                <TableHead className="text-zinc-400 font-medium text-right whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className={isPending ? "opacity-50 pointer-events-none" : ""}>
              {projects.map((project) => (
                <TableRow 
                  key={project.id} 
                  className="border-white/10 hover:bg-white/5 transition-colors cursor-pointer group"
                  onClick={() => handleRowClick(project.id)}
                >
                  <TableCell>
                    <span className="font-mono text-xs text-zinc-400 bg-white/5 px-2 py-1 rounded">{project.projectCode}</span>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-white line-clamp-1">{project.title}</div>
                    <div className="text-xs text-zinc-500 capitalize">{project.category.replace(/_/g, " ").toLowerCase()}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-zinc-300 text-sm">{project.client.businessName}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`border-0 ${getStatusColor(project.status)}`}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs font-medium ${getPaymentColor(project.paymentStatus)}`}>
                      {project.paymentStatus}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {project.client?.phone && (
                        <a 
                          href={whatsappLinks.generalMessage(project.client.phone, `Hi ${project.client.contactPerson || project.client.businessName},\n\nRegarding the project "${project.title}":\n\n`)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-500/10" title="WhatsApp">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleRowClick(project.id); }} className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10" title="View Details">
                        <Eye className="h-4 w-4" />
                      </Button>
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-white/10 p-4 flex items-center justify-between text-sm text-zinc-400 bg-black/20">
            <div>
              Showing <span className="text-white font-medium">{(page - 1) * limit + 1}</span> to <span className="text-white font-medium">{Math.min(page * limit, total)}</span> of <span className="text-white font-medium">{total}</span> projects
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
      </Card>
      
      <ProjectForm open={open} onOpenChange={setOpen} project={editingProject} clients={clients} />
    </>
  );
}

// Ensure limit matches what's fetched
const limit = 50;
