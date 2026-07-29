"use client";

import React from "react";
import { useRouter } from "next/navigation";
import ShootForm from "@/components/shoots/shoot-form";

interface ShootFormClientWrapperProps {
  clients: { id: string; businessName: string }[];
  projects: { id: string; title: string; clientId: string }[];
}

export default function ShootFormClientWrapper({ clients, projects }: ShootFormClientWrapperProps) {
  const router = useRouter();

  return (
    <ShootForm 
      open={true} 
      onOpenChange={(open) => {
        if (!open) {
          router.push("/shoots");
        }
      }} 
      clients={clients}
      projects={projects}
    />
  );
}
