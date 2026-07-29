import React from "react";
import { Folder, Users, Calendar, AlertCircle, IndianRupee } from "lucide-react";
import { EntityConfig } from "@/components/ui/module";
import { ViewType } from "@/components/ui/module/module-view-switcher";
import { Project, Client, User } from "@prisma/client";
import { Typography } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ProjectBulkActions } from "./project-bulk-actions";

type ProjectWithRelations = Project & {
  client: Client;
  assignedUsers: User[];
};

export const projectConfig: EntityConfig<ProjectWithRelations> = {
  metadata: {
    entityName: "Project",
    pluralName: "Projects",
    icon: Folder,
    routes: {
      list: "/projects",
      create: "/projects/new",
      edit: (id) => `/projects/${id}/edit`,
      detail: (id) => `/projects/${id}`,
    },
  },

  views: [
    { id: "list" as ViewType, label: "List" },
    { id: "cards" as ViewType, label: "Cards" },
  ],
  defaultView: "list" as ViewType,

  columns: [
    {
      header: "Project Code",
      accessorKey: "projectCode",
      className: "font-mono text-zinc-400 text-sm",
    },
    {
      header: "Project Name",
      accessorKey: "title",
      cell: (project) => (
        <div className="font-medium text-white">{project.title}</div>
      ),
    },
    {
      header: "Client",
      accessorKey: "client",
      cell: (project) => (
        <div className="text-sm text-zinc-300">
          {project.client?.businessName || "-"}
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (project) => (
        <Badge variant="outline" className="text-xs border-white/20 text-zinc-300">
          {project.status}
        </Badge>
      ),
    },
    {
      header: "Priority",
      accessorKey: "priority",
      cell: (project) => (
        <Badge variant="outline" className={`text-xs border-white/20 ${project.priority === 'HIGH' ? 'text-red-400' : project.priority === 'MEDIUM' ? 'text-yellow-400' : 'text-blue-400'}`}>
          {project.priority}
        </Badge>
      ),
    },
    {
      header: "Team Members",
      accessorKey: "assignedUsers",
      cell: (project) => {
        const count = project.assignedUsers?.length || 0;
        return (
          <div className="text-sm text-zinc-400">
            {count > 0 ? (
              <span title={project.assignedUsers.map(u => u.name || u.email).join(', ')}>
                {count} Assigned
              </span>
            ) : (
              "-"
            )}
          </div>
        );
      },
    },
    {
      header: "Delivery Date",
      accessorKey: "deliveryDate",
      cell: (project) => (
        <div className="text-sm text-zinc-400">
          {project.deliveryDate ? new Date(project.deliveryDate).toLocaleDateString() : "-"}
        </div>
      ),
    }
  ],

  cardRender: (project) => (
    <div className="p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col gap-3 cursor-pointer hover:border-white/20 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <Typography variant="cardTitle">{project.title}</Typography>
          <Typography variant="caption" color="muted">{project.client?.businessName}</Typography>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant="outline" className="text-[10px] py-0">{project.status}</Badge>
          <Badge variant="outline" className={`text-[10px] py-0 ${project.priority === 'HIGH' ? 'text-red-400 border-red-400/50' : project.priority === 'MEDIUM' ? 'text-yellow-400 border-yellow-400/50' : 'text-blue-400 border-blue-400/50'}`}>
            {project.priority}
          </Badge>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 items-center text-xs text-zinc-400 justify-between">
        <span className="font-mono">{project.projectCode}</span>
        {project.deliveryDate && <span>Due: {new Date(project.deliveryDate).toLocaleDateString()}</span>}
      </div>

      {project.assignedUsers && project.assignedUsers.length > 0 && (
        <div className="pt-2 mt-2 border-t border-white/10 flex -space-x-2 overflow-hidden">
          {project.assignedUsers.map((user, idx) => (
            <div 
              key={user.id}
              className="inline-block h-6 w-6 rounded-full ring-2 ring-[#0A0A0A] bg-zinc-800 flex items-center justify-center text-[10px] uppercase text-zinc-300"
              title={user.name || user.email}
            >
              {(user.name || user.email).charAt(0)}
            </div>
          ))}
        </div>
      )}
    </div>
  ),

  filters: [
    {
      id: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Inquiry", value: "INQUIRY" },
        { label: "Planned", value: "PLANNED" },
        { label: "Editing", value: "EDITING" },
        { label: "Review", value: "REVIEW" },
        { label: "Delivered", value: "DELIVERED" },
        { label: "Completed", value: "COMPLETED" },
        { label: "Cancelled", value: "CANCELLED" },
      ]
    },
    {
      id: "priority",
      label: "Priority",
      type: "select",
      options: [
        { label: "High", value: "HIGH" },
        { label: "Medium", value: "MEDIUM" },
        { label: "Low", value: "LOW" },
      ]
    },
    {
      id: "paymentStatus",
      label: "Payment",
      type: "select",
      options: [
        { label: "Pending", value: "PENDING" },
        { label: "Partial", value: "PARTIAL" },
        { label: "Paid", value: "PAID" },
      ]
    },
    // Dynamic filters like 'clientId' will be added dynamically by the server component
  ],

  searchPlaceholder: "Search projects by name, code, or client...",

  bulkActions: (selectedIds, onClearSelection) => (
    <ProjectBulkActions selectedIds={selectedIds} onClearSelection={onClearSelection} />
  ),

  summary: [
    {
      id: "activeProjects",
      title: "Active Projects",
      value: (stats) => (stats?.total?.toString() || "0"),
      icon: Folder,
    },
    {
      id: "upcomingShoots",
      title: "Upcoming Shoots",
      value: (stats) => (stats?.active?.toString() || "0"),
      icon: Calendar,
    },
    {
      id: "overdueDeliveries",
      title: "Overdue Deliveries",
      value: (stats) => (stats?.upcomingShoots?.toString() || "0"),
      icon: AlertCircle,
    },
    {
      id: "totalRevenue",
      title: "Total Revenue",
      value: (stats) => (`₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`),
      icon: IndianRupee,
    },
  ],

  defaultSort: { by: "createdAt", order: "desc" }
};
