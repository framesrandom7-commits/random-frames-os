import { FilterDef } from "@/components/ui/module/module-filters";
import { LeadStatus, LeadPriority, LeadSource } from "@prisma/client";
import { ViewType } from "@/components/ui/module/module-view-switcher";

export function getLeadFilters(users: { id: string, name: string | null, email: string }[]): FilterDef[] {
  return [
    {
      id: "status",
      label: "Status",
      type: "select",
      options: Object.values(LeadStatus).map(status => ({
        label: status.replace(/_/g, " "),
        value: status
      }))
    },
    {
      id: "priority",
      label: "Priority",
      type: "select",
      options: Object.values(LeadPriority).map(priority => ({
        label: priority,
        value: priority
      }))
    },
    {
      id: "source",
      label: "Source",
      type: "select",
      options: Object.values(LeadSource).map(source => ({
        label: source.replace(/_/g, " "),
        value: source
      }))
    },
    {
      id: "assignedTo",
      label: "Assigned User",
      type: "select",
      options: users.map(u => ({
        label: u.name || u.email || u.id,
        value: u.id
      }))
    },
    {
      id: "archived",
      label: "Show Deleted",
      type: "select",
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" }
      ]
    }
  ];
}
