"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash, Key, Shield } from "lucide-react";
import { toast } from "sonner";
import { createUser, deleteUser, updateUserRole, resetUserPassword } from "@/app/actions/user";

export default function UsersTab({ users }: { users: any[] }) {
  const [isAdding, setIsAdding] = useState(false);
  
  const handleResetPassword = async (id: string) => {
    try {
      const res = await resetUserPassword(id);
      toast.success(res.message);
    } catch {
      toast.error("Failed to reset password");
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(id);
      toast.success("User deleted");
    } catch {
      toast.error("Failed to delete user");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-white">Users & Roles</h3>
          <p className="text-sm text-zinc-400">Manage team members and their access permissions.</p>
        </div>
        <Button onClick={() => toast.info("Add User modal placeholder")} className="bg-[#C1121F] hover:bg-[#a00f1a] text-white">
          <Plus className="w-4 h-4 mr-2" /> Add User
        </Button>
      </div>

      <div className="bg-black/20 border border-white/10 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-zinc-400">Name</TableHead>
              <TableHead className="text-zinc-400">Email</TableHead>
              <TableHead className="text-zinc-400">Role</TableHead>
              <TableHead className="text-zinc-400">Added</TableHead>
              <TableHead className="text-zinc-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} className="border-white/10 hover:bg-white/5 transition-colors">
                <TableCell className="font-medium text-white">{u.name}</TableCell>
                <TableCell className="text-zinc-400">{u.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-white/5 border-white/10 text-white">
                    <Shield className="w-3 h-3 mr-1" /> {u.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-zinc-400">
                  {new Date(u.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleResetPassword(u.id)} className="h-8 w-8 text-zinc-400 hover:text-white">
                      <Key className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id)} className="h-8 w-8 text-zinc-400 hover:text-red-400">
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-zinc-500">No users found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="bg-white/5 p-4 rounded-lg border border-white/10 mt-6">
        <h4 className="text-white font-medium mb-2">Role Permissions Reference</h4>
        <ul className="text-sm text-zinc-400 space-y-2">
          <li><strong className="text-white">ADMIN:</strong> Full access to all modules, settings, and billing.</li>
          <li><strong className="text-white">MANAGER:</strong> Can manage leads, projects, shoots, and finances, but cannot delete users or change critical settings.</li>
          <li><strong className="text-white">EDITOR:</strong> Can only update task statuses and upload project files.</li>
          <li><strong className="text-white">VIEWER:</strong> Read-only access to assigned projects.</li>
        </ul>
      </div>
    </div>
  );
}
