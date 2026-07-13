"use client";

import React, { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2 } from "lucide-react";
import { convertLeadToClient } from "@/app/actions/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ConvertToClientButton({ leadId, disabled }: { leadId: string, disabled?: boolean }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleConvert = () => {
    if (confirm("Are you sure you want to convert this lead to a client? This will copy their details and mark the lead as WON.")) {
      startTransition(async () => {
        const result = await convertLeadToClient(leadId);
        if (result.success) {
          toast.success("Lead converted to client successfully!");
          router.push(`/clients/${result.clientId}`);
        } else {
          toast.error(result.error || "Failed to convert lead to client");
        }
      });
    }
  };

  return (
    <Button 
      onClick={handleConvert} 
      disabled={isPending || disabled}
      className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg"
    >
      {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
      Convert to Client
    </Button>
  );
}
