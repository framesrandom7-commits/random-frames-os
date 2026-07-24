import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { NewLeadForm } from "@/components/leads/new-lead-form";

export const metadata = {
  title: "New Lead - Random Frames",
  description: "Create a new lead inquiry",
};

export default function NewLeadPage() {
  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <PageHeader 
        title="Create New Lead"
        subtitle="Enter the details of the new inquiry. Required fields are marked with an asterisk (*)."
      />
      
      <NewLeadForm />
    </div>
  );
}
