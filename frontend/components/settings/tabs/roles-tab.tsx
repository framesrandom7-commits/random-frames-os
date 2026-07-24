"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RolesTab({ roles }: { roles: any[] }) {
  const [selectedRole, setSelectedRole] = useState<any | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-white">Roles & Permissions</h3>
          <p className="text-sm text-zinc-400">View system roles and their configured permissions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Roles List */}
        <div className="md:col-span-1 bg-black/20 border border-white/10 rounded-lg overflow-hidden h-fit">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-zinc-400">Role</TableHead>
                <TableHead className="text-zinc-400 text-right">Users</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles?.map((role) => (
                <TableRow 
                  key={role.id} 
                  className={`border-white/10 cursor-pointer transition-colors ${selectedRole?.id === role.id ? 'bg-white/10' : 'hover:bg-white/5'}`}
                  onClick={() => setSelectedRole(role)}
                >
                  <TableCell className="font-medium text-white">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#E53935]" />
                      {role.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-zinc-400">
                    <Badge variant="outline" className="bg-white/5 border-white/10 text-zinc-300">
                      <Users className="w-3 h-3 mr-1" /> {role._count?.users || 0}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {(!roles || roles.length === 0) && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-6 text-zinc-500">No roles found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Role Details */}
        <div className="md:col-span-2 bg-black/20 border border-white/10 rounded-lg p-6">
          {selectedRole ? (
            <div className="space-y-6">
              <div>
                <h4 className="text-xl font-bold text-white flex items-center gap-2">
                  <Shield className="text-[#E53935]" />
                  {selectedRole.name}
                  {selectedRole.isSystem && (
                    <Badge variant="outline" className="ml-2 bg-[#E53935]/10 text-[#E53935] border-[#E53935]/20">
                      System Role
                    </Badge>
                  )}
                </h4>
                <p className="text-sm text-zinc-400 mt-2">{selectedRole.description}</p>
              </div>
              
              <hr className="border-white/10" />

              <div>
                <h5 className="text-white font-medium mb-4">Configured Permissions</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedRole.permissions?.map((rp: any) => (
                    <div key={rp.permission.id} className="flex flex-col p-3 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-sm font-medium text-white">{rp.permission.action}</span>
                      <span className="text-xs text-zinc-500">{rp.permission.module || "General"} module</span>
                    </div>
                  ))}
                  {(!selectedRole.permissions || selectedRole.permissions.length === 0) && (
                    <div className="text-sm text-zinc-500">No specific permissions configured.</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-zinc-500">
              <Shield className="w-12 h-12 mb-4 opacity-20" />
              <p>Select a role from the list to view its permissions.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white/5 p-4 rounded-lg border border-white/10 mt-6 flex items-center justify-between">
        <div>
          <h4 className="text-white font-medium mb-1">Custom Roles</h4>
          <p className="text-sm text-zinc-400">The underlying architecture supports custom roles, but editing is disabled for System Roles in Version 1.</p>
        </div>
        <Button variant="outline" disabled className="border-white/10 bg-transparent text-zinc-500 cursor-not-allowed">
          Create Custom Role
        </Button>
      </div>
    </div>
  );
}
