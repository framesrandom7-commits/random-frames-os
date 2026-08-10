import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { NewLeadForm } from "@/components/leads/new-lead-form";

import { getCustomFields } from "@/app/actions/custom-fields";

export const metadata = {
  title: "New Lead - Random Frames",
  description: "Create a new lead inquiry",
};

export default async function NewLeadPage() {
  const customFields = await getCustomFields("LEAD");

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <PageHeader 
        title="Create New Lead" />
      
      <NewLeadForm customFields={customFields} />
    </div>
  );
}
