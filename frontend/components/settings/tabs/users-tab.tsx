"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Shield, UserX, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { toggleUserStatus, inviteUser } from "@/app/actions/team";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function UsersTab({ users, roles }: { users: any[], roles?: any[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleToggleStatus = async (id: string, isDeactivating: boolean) => {
    if(isDeactivating && !confirm("Are you sure you want to deactivate this user?")) return;
    try {
      const res = await toggleUserStatus(id, isDeactivating);
      if (res.error) toast.error(res.error);
      else toast.success(res.success);
    } catch {
      toast.error("Failed to update user status");
    }
  };

  const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const res = await inviteUser(formData);
    
    if (res.error) {
      toast.error(res.error);
    } else if (res.success) {
      toast.success(res.success);
      setIsAdding(false);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-white">Team Management</h3>
          <p className="text-sm text-zinc-400">Manage team members and their access permissions.</p>
        </div>
        
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger render={<Button className="bg-[#E53935] hover:bg-red-700 text-white" />}>
            <Plus className="w-4 h-4 mr-2" /> Invite User
          </DialogTrigger>
          <DialogContent className="bg-[#171A21] border border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Invite New Team Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleInvite} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Full Name</label>
                <input name="name" required className="w-full h-10 bg-black/40 border border-white/10 rounded-lg px-3 text-sm focus:border-[#E53935] focus:outline-none" placeholder="e.g. Ram" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">System Login Email</label>
                <input type="email" name="loginEmail" required className="w-full h-10 bg-black/40 border border-white/10 rounded-lg px-3 text-sm focus:border-[#E53935] focus:outline-none" placeholder="e.g. Ram@randomframes.in" />
                <p className="text-xs text-zinc-500">The email they will use to log into the system.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Contact Email (Setup Link Destination)</label>
                <input type="email" name="contactEmail" required className="w-full h-10 bg-black/40 border border-white/10 rounded-lg px-3 text-sm focus:border-[#E53935] focus:outline-none" placeholder="e.g. ram.personal@gmail.com" />
                <p className="text-xs text-zinc-500">The secure password setup link will be emailed here.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Role</label>
                <select name="roleId" required className="w-full h-10 bg-black/40 border border-white/10 rounded-lg px-3 text-sm focus:border-[#E53935] focus:outline-none">
                  {roles?.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" className="border-white/10 hover:bg-white/5 text-white bg-transparent" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-[#E53935] hover:bg-red-700 text-white">
                  {isSubmitting ? "Inviting..." : "Send Invite"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-black/20 border border-white/10 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-zinc-400">Name</TableHead>
              <TableHead className="text-zinc-400">Login Email</TableHead>
              <TableHead className="text-zinc-400">Contact Email</TableHead>
              <TableHead className="text-zinc-400">Role</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="text-zinc-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => {
              const isDeactivated = !!u.archivedAt;
              return (
                <TableRow key={u.id} className={`border-white/10 transition-colors ${isDeactivated ? 'opacity-50' : 'hover:bg-white/5'}`}>
                  <TableCell className="font-medium text-white">{u.name}</TableCell>
                  <TableCell className="text-zinc-400">{u.email}</TableCell>
                  <TableCell className="text-zinc-400 text-xs">{u.contactEmail || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-white/5 border-white/10 text-white">
                      <Shield className="w-3 h-3 mr-1" /> {u.role?.name || "No Role"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={isDeactivated ? "bg-red-900/20 text-red-400 border-red-900/50" : "bg-green-900/20 text-green-400 border-green-900/50"}>
                      {isDeactivated ? "Deactivated" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleToggleStatus(u.id, !isDeactivated)} 
                        className={`h-8 w-8 text-zinc-400 ${isDeactivated ? 'hover:text-green-400' : 'hover:text-red-400'}`}
                        title={isDeactivated ? "Reactivate User" : "Deactivate User"}
                      >
                        {isDeactivated ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-zinc-500">No users found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
