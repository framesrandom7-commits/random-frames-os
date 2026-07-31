"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2 } from "lucide-react";
import { convertLead } from "@/app/actions/lead";
import { toast } from "sonner";

export default function ConvertToClientButton({ leadId, disabled }: { leadId: string, disabled?: boolean }) {
  const [loading, setLoading] = useState(false);

  const handleConvert = async () => {
    if (confirm("Are you sure you want to convert this lead?")) {
      setLoading(true);
      const success = await convertLead(leadId);
      setLoading(false);
      if (success) {
        toast.success("Lead converted successfully");
      } else {
        toast.error("Failed to convert lead");
      }
    }
  };

  return (
    <Button 
      onClick={handleConvert} 
      disabled={disabled || loading}
      className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg"
    >
      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
      Convert to Client
    </Button>
  );
}
