"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function CopyOnboardingLinkButton({ leadId }: { leadId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const link = `${window.location.origin}/onboarding/${leadId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Onboarding link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleCopy}
      className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
    >
      {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
      {copied ? "Copied!" : "Copy Onboarding Link"}
    </Button>
  );
}
