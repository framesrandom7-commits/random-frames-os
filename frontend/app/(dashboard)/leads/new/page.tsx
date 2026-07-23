import React from "react";
import Topbar from "@/components/dashboard/topbar";
import { NewLeadForm } from "@/components/leads/new-lead-form";

export const metadata = {
  title: "New Lead - Random Frames",
  description: "Create a new lead inquiry",
};

export default function NewLeadPage() {
  return (
    <>
      <Topbar title="New Lead" />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#050505]">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white tracking-tight">Create New Lead</h2>
            <p className="text-zinc-400 mt-1">
              Enter the details of the new inquiry. Required fields are marked with an asterisk (*).
            </p>
          </div>
          
          <NewLeadForm />
        </div>
      </main>
    </>
  );
}
