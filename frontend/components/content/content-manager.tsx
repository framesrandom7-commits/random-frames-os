"use client";

import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContentPlatform, ContentEditingStatus, ContentApprovalStatus, ContentPublishingStatus } from "@prisma/client";
import { Plus, Search, Edit, Trash } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { createContentPlan, updateContentPlan, deleteContentPlan, CreateContentData } from "@/app/actions/content";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function ContentManager({ data, allProjects }: { data: any[], allProjects: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<any>(null);

  const filteredData = data.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  const handleOpenForm = (content?: any) => {
    setEditingContent(content || null);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this content plan?")) return;
    startTransition(async () => {
      const res = await deleteContentPlan(id);
      if (res.success) toast.success("Content deleted");
      else toast.error("Failed to delete content");
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-white">Content Pipeline</h1>
        <Button onClick={() => handleOpenForm()} className="bg-[#C1121F] hover:bg-[#a00f1a] text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Content
        </Button>
      </div>

      <div className="flex items-center space-x-2 bg-black/40 border border-white/10 rounded-md p-2">
        <Search className="w-5 h-5 text-zinc-400" />
        <Input 
          placeholder="Search content..." 
          value={search} 
          onChange={e => setSearch(e.target.value)}
          className="border-0 bg-transparent text-white focus-visible:ring-0 shadow-none"
        />
      </div>

      <div className="border border-white/10 rounded-md overflow-hidden bg-[#111]">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-white/10 hover:bg-transparent">
              <TableHead className="text-zinc-400 font-medium">Title</TableHead>
              <TableHead className="text-zinc-400 font-medium">Project</TableHead>
              <TableHead className="text-zinc-400 font-medium">Platform</TableHead>
              <TableHead className="text-zinc-400 font-medium">Status (Pipeline)</TableHead>
              <TableHead className="text-zinc-400 font-medium text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow className="border-b border-white/10">
                <TableCell colSpan={5} className="text-center text-zinc-500 py-8">
                  No content found.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map(c => (
                <TableRow key={c.id} className="border-b border-white/10 border-dashed hover:bg-white/5 transition-colors">
                  <TableCell className="font-medium text-zinc-200">{c.title}</TableCell>
                  <TableCell className="text-zinc-400">{c.project?.title || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-white/20 text-zinc-300">
                      {c.platform}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1 text-xs">
                      <span className="text-zinc-400">Edit: <span className="text-white">{c.editingStatus}</span></span>
                      <span className="text-zinc-400">Approve: <span className="text-white">{c.approvalStatus}</span></span>
                      <span className="text-zinc-400">Publish: <span className="text-white">{c.publishingStatus}</span></span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenForm(c)} className="text-zinc-400 hover:text-white">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} className="text-zinc-400 hover:text-red-400">
                      <Trash className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ContentFormDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        content={editingContent} 
        projects={allProjects} 
      />
    </div>
  );
}

function ContentFormDialog({ open, onOpenChange, content, projects }: any) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<any>({});

  React.useEffect(() => {
    let mounted = true;
    if (mounted) {
      if (open) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData(content || {
          platform: "INSTAGRAM",
          editingStatus: "PENDING",
          approvalStatus: "PENDING",
          publishingStatus: "DRAFT"
        });
      }
    }
    return () => { mounted = false; };
  }, [content, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.projectId) {
      toast.error("Title and Project are required");
      return;
    }

    startTransition(async () => {
      const dataToSubmit = {
        title: formData.title,
        description: formData.description,
        platform: formData.platform as ContentPlatform,
        projectId: formData.projectId,
        editingStatus: formData.editingStatus as ContentEditingStatus,
        approvalStatus: formData.approvalStatus as ContentApprovalStatus,
        publishingStatus: formData.publishingStatus as ContentPublishingStatus,
      };

      if (content?.id) {
        const res = await updateContentPlan(content.id, dataToSubmit);
        if (res.success) {
          toast.success("Content updated");
          onOpenChange(false);
        } else toast.error("Failed to update");
      } else {
        const res = await createContentPlan(dataToSubmit);
        if (res.success) {
          toast.success("Content created");
          onOpenChange(false);
        } else toast.error("Failed to create");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111] border-white/10 text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{content ? "Edit Content" : "Add Content"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input 
              value={formData.title || ""} 
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="bg-black/40 border-white/10"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Project *</Label>
            <Select value={formData.projectId || ""} onValueChange={v => setFormData({ ...formData, projectId: v })}>
              <SelectTrigger className="bg-black/40 border-white/10"><SelectValue/></SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                {projects.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Platform</Label>
            <Select value={formData.platform || "INSTAGRAM"} onValueChange={v => setFormData({ ...formData, platform: v })}>
              <SelectTrigger className="bg-black/40 border-white/10"><SelectValue/></SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                {Object.values(ContentPlatform).map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {content && (
            <>
              <div className="space-y-2">
                <Label>Editing Status</Label>
                <Select value={formData.editingStatus} onValueChange={v => setFormData({ ...formData, editingStatus: v })}>
                  <SelectTrigger className="bg-black/40 border-white/10"><SelectValue/></SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                    {Object.values(ContentEditingStatus).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Approval Status</Label>
                <Select value={formData.approvalStatus} onValueChange={v => setFormData({ ...formData, approvalStatus: v })}>
                  <SelectTrigger className="bg-black/40 border-white/10"><SelectValue/></SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                    {Object.values(ContentApprovalStatus).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Publishing Status</Label>
                <Select value={formData.publishingStatus} onValueChange={v => setFormData({ ...formData, publishingStatus: v })}>
                  <SelectTrigger className="bg-black/40 border-white/10"><SelectValue/></SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                    {Object.values(ContentPublishingStatus).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending} className="bg-[#C1121F] hover:bg-[#a00f1a] text-white">
              {isPending ? "Saving..." : "Save Content"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
