"use client";

import React from "react";
import { useRouter } from "next/navigation";
import ClientOnboardingForm from "@/components/clients/client-onboarding-form";

export default function NewClientPage() {
  const router = useRouter();

  return (
    <div className="flex-1 w-full h-full bg-transparent">
      <ClientOnboardingForm 
        open={true} 
        onOpenChange={(open) => {
          if (!open) {
            router.push("/clients");
          }
        }} 
      />
    </div>
  );
}
