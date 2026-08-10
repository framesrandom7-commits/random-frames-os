"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Form Components
import { NewLeadForm } from "@/components/leads/new-lead-form";
import ClientForm from "@/components/clients/client-form";
import ProjectForm from "@/components/projects/project-form";
import ShootForm from "@/components/shoots/shoot-form";

// Actions
import { getCustomFields } from "@/app/actions/custom-fields";
import { getClients } from "@/app/actions/client";
import { getUsers } from "@/app/actions/user";
import { getProjects } from "@/app/actions/project";

export function GlobalModals() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeModal = searchParams.get("new");

  const [leadFields, setLeadFields] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const close = () => {
    // Preserve other search params, just remove 'new'
    const params = new URLSearchParams(searchParams.toString());
    params.delete("new");
    const newQuery = params.toString();
    router.push(`${pathname}${newQuery ? `?${newQuery}` : ""}`);
  };

  // Fetch dependencies based on active modal
  useEffect(() => {
    if (activeModal === "lead" && leadFields.length === 0) {
      getCustomFields("LEAD").then(setLeadFields);
    }

    if ((activeModal === "project" || activeModal === "shoot") && clients.length === 0) {
      getClients({ limit: 1000 }).then((res) => {
        if (res && res.clients) setClients(res.clients.map((c: any) => ({ id: c.id, businessName: c.businessName })));
      });
    }

    if (activeModal === "project" && users.length === 0) {
      getUsers().then((res) => {
        if (res) setUsers(res.map((u: any) => ({ id: u.id, name: u.name, email: u.email })));
      });
    }

    if (activeModal === "shoot" && projects.length === 0) {
      getProjects({ limit: 1000 }).then((res) => {
        if (res && res.projects) setProjects(res.projects.map((p: any) => ({ id: p.id, title: p.title, clientId: p.clientId })));
      });
    }
  }, [activeModal, leadFields.length, clients.length, users.length, projects.length]);

  return (
    <>
      {/* New Lead Modal */}
      <Dialog open={activeModal === "lead"} onOpenChange={(open) => !open && close()}>
        <DialogContent className="w-full max-w-4xl sm:max-w-4xl md:max-w-5xl max-h-[90vh] flex flex-col bg-zinc-950/10 backdrop-blur-lg border border-white/10 text-white p-0 overflow-hidden">
          <DialogHeader className="px-6 py-5 border-b border-white/10 shrink-0 bg-transparent">
            <DialogTitle className="text-2xl font-bold">Create New Lead</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
            <NewLeadForm customFields={leadFields} className="flex-1 min-h-0" />
          </div>
        </DialogContent>
      </Dialog>

      {/* New Client Modal */}
      <ClientForm
        open={activeModal === "client"}
        onOpenChange={(open) => !open && close()}
      />

      {/* New Project Modal */}
      <Dialog open={activeModal === "project"} onOpenChange={(open) => !open && close()}>
        <DialogContent className="w-full max-w-4xl sm:max-w-4xl md:max-w-5xl max-h-[90vh] flex flex-col overflow-hidden bg-zinc-950/10 backdrop-blur-lg border-white/10 text-white p-0">
          <DialogHeader className="px-6 py-5 border-b border-white/10 shrink-0 bg-transparent">
            <DialogTitle className="text-2xl font-bold">Create New Project</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
            <ProjectForm clients={clients} users={users} className="flex-1 min-h-0" />
          </div>
        </DialogContent>
      </Dialog>

      {/* New Shoot Modal */}
      <ShootForm
        open={activeModal === "shoot"}
        onOpenChange={(open) => !open && close()}
        clients={clients}
        projects={projects}
      />
    </>
  );
}
