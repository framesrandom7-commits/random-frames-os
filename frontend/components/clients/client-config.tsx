import React from "react";
import { Users, Building, FileText, AlertCircle } from "lucide-react";
import { EntityConfig } from "@/components/ui/module";
import { ViewType } from "@/components/ui/module/module-view-switcher";
import { Client } from "@prisma/client";
import { Typography } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { ClientBulkActions } from "./client-bulk-actions";

export const clientConfig: EntityConfig<Client> = {
  metadata: {
    entityName: "Client",
    pluralName: "Clients",
    icon: Users,
    routes: {
      list: "/clients",
      create: "/clients/new",
      edit: (id) => `/clients/${id}/edit`,
      detail: (id) => `/clients/${id}`,
    },
  },

  views: [
    { id: "list" as ViewType, label: "List" }
  ],
  defaultView: "list" as ViewType,

  columns: [
    {
      header: "Code",
      accessorKey: "clientCode",
      className: "font-mono text-zinc-400 text-sm",
    },
    {
      header: "Business Name",
      accessorKey: "businessName",
      cell: (client) => (
        <div className="font-medium text-white">{client.businessName}</div>
      ),
    },
    {
      header: "Contact",
      accessorKey: "contactPerson",
      cell: (client) => (
        <div>
          <div className="text-sm text-zinc-300">{client.contactPerson || "-"}</div>
          <div className="text-xs text-zinc-500">{client.email || client.phone || "-"}</div>
        </div>
      ),
    },
    {
      header: "Type",
      accessorKey: "businessType",
      cell: (client) => (
        <Badge variant="outline" className="text-xs border-white/20 text-zinc-300">
          {client.businessType}
        </Badge>
      ),
    },
    {
      header: "Created",
      accessorKey: "createdAt",
      cell: (client) => (
        <div className="text-sm text-zinc-400">
          {new Date(client.createdAt).toLocaleDateString()}
        </div>
      ),
    }
  ],

  cardRender: (client) => (
    <div className="p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col gap-3 cursor-pointer hover:border-white/20 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <Typography variant="cardTitle">{client.businessName}</Typography>
          {client.contactPerson && <Typography variant="caption" color="muted">{client.contactPerson}</Typography>}
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant="outline" className="text-[10px] py-0">{client.businessType}</Badge>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 items-center text-xs text-zinc-400">
        <span className="font-mono">{client.clientCode}</span>
        {client.email && <span>• {client.email}</span>}
      </div>
    </div>
  ),

  filters: [
    {
      id: "businessType",
      label: "Business Type",
      type: "select",
      options: [
        { label: "B2B", value: "B2B" },
        { label: "B2C", value: "B2C" },
        { label: "D2C", value: "D2C" },
        { label: "OTHER", value: "OTHER" },
      ]
    },
    {
      id: "archived",
      label: "Status",
      type: "select",
      options: [
        { label: "Active", value: "false" },
        { label: "Archived", value: "true" }
      ]
    }
  ],
  
  searchPlaceholder: "Search clients...",

  bulkActions: (selectedIds, onClearSelection) => (
    <ClientBulkActions selectedIds={selectedIds} onClearSelection={onClearSelection} />
  ),

  summary: [
    {
      id: "total",
      title: "Total Clients",
      value: (stats) => stats.totalClients || 0,
      icon: Users,
    },
    {
      id: "new",
      title: "New This Month",
      value: (stats) => `+${stats.newClientsThisMonth || 0}`,
      icon: Building,
    },
    {
      id: "active",
      title: "Active Clients",
      value: (stats) => stats.activeClients || 0,
      icon: FileText,
    },
    {
      id: "inactive",
      title: "Inactive Clients",
      value: (stats) => stats.inactiveClients || 0,
      icon: AlertCircle,
    }
  ],

  defaultSort: {
    by: "createdAt",
    order: "desc"
  }
};
