"use client";

import React, { useState, useEffect } from "react";
import { Plus, Users, UserCircle, Briefcase, Camera, FileText, Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

// Import all forms
import LeadForm from "@/components/leads/lead-form";
import ClientOnboardingForm from "@/components/clients/client-onboarding-form";
import ProjectForm from "@/components/projects/project-form";
import ShootForm from "@/components/shoots/shoot-form";

import { getClients } from "@/app/actions/client";
import { getProjects } from "@/app/actions/project";

export default function QuickCreateMenu() {
  const [openLead, setOpenLead] = useState(false);
  const [openClient, setOpenClient] = useState(false);
  const [openProject, setOpenProject] = useState(false);
  const [openShoot, setOpenShoot] = useState(false);
  const router = useRouter();

  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [fetchedClients, fetchedProjects] = await Promise.all([
        getClients(),
        getProjects()
      ]);
      setClients(fetchedClients.clients || []);
      setProjects(fetchedProjects.projects || []);
    };
    fetchData();
  }, []);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="w-full flex items-center justify-start bg-[#C1121F] hover:bg-[#a00f1a] text-white gap-2 font-medium shadow-md rounded-md px-4 py-2 focus:outline-none transition-colors h-10">
          <Plus className="w-4 h-4" />
          New
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-zinc-900 border-white/10 text-zinc-200 p-2" sideOffset={8}>
          <DropdownMenuItem className="gap-3 cursor-pointer focus:bg-white/10 focus:text-white" onSelect={() => setOpenLead(true)}>
            <Users className="w-4 h-4 text-emerald-400" />
            Lead / Enquiry
          </DropdownMenuItem>
          
          <DropdownMenuItem className="gap-3 cursor-pointer focus:bg-white/10 focus:text-white" onSelect={() => setOpenClient(true)}>
            <UserCircle className="w-4 h-4 text-blue-400" />
            Client
          </DropdownMenuItem>
          
          <DropdownMenuItem className="gap-3 cursor-pointer focus:bg-white/10 focus:text-white" onSelect={() => setOpenProject(true)}>
            <Briefcase className="w-4 h-4 text-purple-400" />
            Project
          </DropdownMenuItem>
          
          <DropdownMenuItem className="gap-3 cursor-pointer focus:bg-white/10 focus:text-white" onSelect={() => setOpenShoot(true)}>
            <Camera className="w-4 h-4 text-amber-400" />
            Shoot
          </DropdownMenuItem>
          
          <DropdownMenuItem className="gap-3 cursor-pointer focus:bg-white/10 focus:text-white" onSelect={() => router.push('/finance/invoices')}>
            <FileText className="w-4 h-4 text-rose-400" />
            Invoice
          </DropdownMenuItem>
          
          <DropdownMenuItem className="gap-3 cursor-pointer focus:bg-white/10 focus:text-white" onSelect={() => router.push('/notifications')}>
            <Bell className="w-4 h-4 text-yellow-400" />
            Reminder
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <LeadForm open={openLead} onOpenChange={setOpenLead} />
      <ClientOnboardingForm open={openClient} onOpenChange={setOpenClient} />
      <ProjectForm open={openProject} onOpenChange={setOpenProject} clients={clients} />
      <ShootForm open={openShoot} onOpenChange={setOpenShoot} clients={clients} projects={projects} />
    </>
  );
}
