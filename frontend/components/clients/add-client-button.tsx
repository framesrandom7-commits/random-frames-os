"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ClientOnboardingForm from "@/components/clients/client-onboarding-form";

export default function AddClientButton({ label = "Add Client", className = "" }: { label?: string, className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setOpen(true)} 
        className={`bg-[#C1121F] text-white hover:bg-[#a00f1a] shadow-lg ${className}`}
      >
        <Plus className="mr-2 h-4 w-4" /> {label}
      </Button>

      <ClientOnboardingForm 
        open={open} 
        onOpenChange={setOpen} 
      />
    </>
  );
}
