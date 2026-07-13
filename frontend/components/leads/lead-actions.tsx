"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import LeadForm from "./lead-form";

export default function LeadActions() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} className="w-full sm:w-auto bg-[#C1121F] text-white hover:bg-[#a00f1a] h-9 transition-colors shadow-lg shadow-[#C1121F]/20">
        <Plus className="mr-2 h-4 w-4" />
        Add Lead
      </Button>
      <LeadForm open={open} onOpenChange={setOpen} />
    </>
  );
}
