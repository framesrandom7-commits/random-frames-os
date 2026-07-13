"use client";

import React, { useState, useTransition } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Edit, Trash2, ExternalLink, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Copy, Calendar as CalendarIcon, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Shoot, Client, Project } from "@prisma/client";
import { deleteShoot, duplicateShoot } from "@/app/actions/shoot";
import ShootForm from "./shoot-form";
import { Badge } from "@/components/ui/badge";

interface ShootWithRelations extends Shoot {
  client: Client;
  project: Project;
}

interface ShootTableProps {
  shoots: ShootWithRelations[];
  clients: { id: string; businessName: string }[];
  projects: { id: string; title: string; clientId: string }[];
  page?: number;
  totalPages?: number;
  total?: number;
}

export default function ShootTable({ shoots, clients, projects, page = 1, totalPages = 1, total = 0 }: ShootTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [open, setOpen] = useState(false);
  const [editingShoot, setEditingShoot] = useState<Shoot | undefined>(undefined);

  const isArchived = searchParams.get("archived") === "true";
  const sortBy = searchParams.get("sortBy") || "date";
  const sortOrder = searchParams.get("sortOrder") || "asc";

  const handleEdit = (e: React.MouseEvent, shoot: Shoot) => {
    e.stopPropagation();
    setEditingShoot(shoot);
    setOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to archive this shoot?")) {
      startTransition(async () => {
        const success = await deleteShoot(id);
        if (success) {
          toast.success("Shoot archived successfully");
        } else {
          toast.error("Failed to archive shoot");
        }
      });
    }
  };

  const handleDuplicate = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    startTransition(async () => {
      const result = await duplicateShoot(id);
      if (result.success) {
        toast.success("Shoot duplicated successfully");
      } else {
        toast.error("Failed to duplicate shoot");
      }
    });
  };

  const handleRowClick = (id: string) => {
    router.push(`/shoots/${id}`);
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

  if (shoots.length === 0) {
    return (
      <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
        <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
          <div className="h-24 w-24 rounded-full bg-white/5 flex items-center justify-center mb-6 ring-1 ring-white/10">
            <Camera className="h-10 w-10 text-zinc-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No shoots found</h3>
          <p className="text-zinc-400 max-w-sm mb-8">
            {isArchived ? "There are no archived shoots." : "Get started by scheduling your first shoot."}
          </p>
          {!isArchived && (
            <Button onClick={() => { setEditingShoot(undefined); setOpen(true); }} className="bg-[#C1121F] text-white hover:bg-[#a00f1a] px-8 h-11 shadow-lg">
              Schedule Shoot
            </Button>
          )}
          <ShootForm open={open} onOpenChange={setOpen} shoot={editingShoot} clients={clients} projects={projects} />
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
      case 'SCHEDULED': return 'bg-blue-500/20 text-blue-400';
      case 'CONFIRMED': return 'bg-purple-500/20 text-purple-400';
      case 'IN_PROGRESS': return 'bg-amber-500/20 text-amber-400';
      case 'COMPLETED': return 'bg-emerald-500/20 text-emerald-400';
      case 'CANCELLED': return 'bg-red-500/20 text-red-400';
      case 'POSTPONED': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-zinc-500/20 text-zinc-400';
    }
  };

  return (
    <>
      <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-lg overflow-hidden relative">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-black/40">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-zinc-400 font-medium whitespace-nowrap cursor-pointer hover:text-white transition-colors w-24" onClick={() => handleSort("date")}>
                  Date {renderSortIcon("date")}
                </TableHead>
                <TableHead className="text-zinc-400 font-medium whitespace-nowrap cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("title")}>
                  Shoot {renderSortIcon("title")}
                </TableHead>
                <TableHead className="text-zinc-400 font-medium whitespace-nowrap">
                  Project
                </TableHead>
                <TableHead className="text-zinc-400 font-medium whitespace-nowrap">
                  Logistics
                </TableHead>
                <TableHead className="text-zinc-400 font-medium whitespace-nowrap cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("status")}>
                  Status {renderSortIcon("status")}
                </TableHead>
                <TableHead className="text-zinc-400 font-medium text-right whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className={isPending ? "opacity-50 pointer-events-none" : ""}>
              {shoots.map((shoot) => (
                <TableRow 
                  key={shoot.id} 
                  className="border-white/10 hover:bg-white/5 transition-colors cursor-pointer group"
                  onClick={() => handleRowClick(shoot.id)}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-white whitespace-nowrap">
                        {shoot.date ? new Date(shoot.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : "TBD"}
                      </span>
                      {shoot.startTime && (
                        <span className="text-xs text-zinc-500">
                          {shoot.startTime} {shoot.endTime ? `- ${shoot.endTime}` : ''}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-white line-clamp-1">{shoot.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-[10px] text-zinc-400 bg-white/5 px-1.5 py-0.5 rounded">{shoot.shootCode}</span>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{shoot.shootType.replace(/_/g, " ")}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-zinc-300 text-sm line-clamp-1">{shoot.project.title}</div>
                    <div className="text-xs text-zinc-500 line-clamp-1">{shoot.client.businessName}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-xs text-zinc-400 max-w-[200px]">
                      {shoot.location ? (
                        <span className="flex items-start gap-1 truncate" title={shoot.location}>
                          <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-zinc-500" />
                          <span className="truncate">{shoot.location}</span>
                        </span>
                      ) : <span className="text-zinc-600 italic">No location set</span>}
                      {shoot.photographer && (
                        <span className="flex items-center gap-1 truncate" title={shoot.photographer}>
                          <Camera className="w-3 h-3 shrink-0 text-zinc-500" />
                          <span className="truncate">{shoot.photographer}</span>
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`border-0 ${getStatusColor(shoot.status)}`}>
                      {shoot.status.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleRowClick(shoot.id); }} className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10" title="View Details">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      {!isArchived && (
                        <>
                          <Button variant="ghost" size="icon" onClick={(e) => handleDuplicate(e, shoot.id)} className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10" title="Duplicate">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={(e) => handleEdit(e, shoot)} className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10" title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={(e) => handleDelete(e, shoot.id)} className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-500/10" title="Archive">
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
              Showing <span className="text-white font-medium">{(page - 1) * 50 + 1}</span> to <span className="text-white font-medium">{Math.min(page * 50, total)}</span> of <span className="text-white font-medium">{total}</span> shoots
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
      
      <ShootForm open={open} onOpenChange={setOpen} shoot={editingShoot} clients={clients} projects={projects} />
    </>
  );
}
