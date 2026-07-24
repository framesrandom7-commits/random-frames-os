import * as React from "react";
import {
  ModuleLayout,
  ModuleContent,
  ModuleHeader,
  ModuleToolbar,
  ModuleDataView,
  ModulePagination
} from "@/components/ui/module";
import { Button } from "@/components/ui/button";

// Dummy data
const mockData = [
  { id: "1", name: "Project Alpha", status: "active", owner: "Alice" },
  { id: "2", name: "Project Beta", status: "completed", owner: "Bob" },
  { id: "3", name: "Project Gamma", status: "paused", owner: "Charlie" },
];

export default function TestModulePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const columns = [
    { header: "Name", accessorKey: "name" },
    { header: "Status", accessorKey: "status" },
    { header: "Owner", accessorKey: "owner" }
  ];

  const cardRender = (row: any) => (
    <div className="p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col gap-2">
      <div className="font-semibold text-white">{row.name}</div>
      <div className="text-sm text-zinc-400">Status: {row.status}</div>
      <div className="text-sm text-zinc-400">Owner: {row.owner}</div>
    </div>
  );

  return (
    <ModuleLayout>
      <ModuleHeader 
        title="Test Business Module" 
        subtitle="This is a test of the Business Module Framework"
        primaryAction={<Button>Add Record</Button>} 
      />
      <ModuleToolbar 
        searchPlaceholder="Search records..."
        filters={[
          { id: "status", label: "Status", type: "select", options: [{ label: "Active", value: "active" }, { label: "Completed", value: "completed" }] }
        ]}
      />
      <ModuleContent>
        <ModuleDataView 
          data={mockData}
          columns={columns}
          cardRender={cardRender}
          getRowId={(row) => row.id}
          pagination={{ totalCount: 3 }}
        />
      </ModuleContent>
    </ModuleLayout>
  );
}
