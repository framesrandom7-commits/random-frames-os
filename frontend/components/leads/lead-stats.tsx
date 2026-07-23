import React from "react";
import StatCard from "@/components/dashboard/stat-card";
import { Users, UserPlus, PhoneForwarded, Trophy, XCircle } from "lucide-react";
import { Lead, LeadStatus } from "@prisma/client";

export default function LeadStats({ leads }: { leads: Lead[] }) {
  const total = leads.length;
  const newLeads = leads.filter(l => l.status === LeadStatus.NEW).length;
  const attended = leads.filter(l => l.status === LeadStatus.ATTENDED || l.status === LeadStatus.REQUIREMENT_DISCUSSION).length;
  const quotations = leads.filter(l => l.status === LeadStatus.QUOTATION_SENT || l.status === LeadStatus.NEGOTIATION || l.status === LeadStatus.QUOTATION_ACCEPTED).length;
  const converted = leads.filter(l => l.status === LeadStatus.CONVERTED_TO_CLIENT).length;
  const lost = leads.filter(l => l.status === LeadStatus.CLOSED_LOST).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <StatCard title="Total Leads" value={total.toString()} icon={Users} trend="All time" />
      <StatCard title="New Leads" value={newLeads.toString()} icon={UserPlus} trend="Needs action" />
      <StatCard title="Attended" value={attended.toString()} icon={PhoneForwarded} trend="Discussing" />
      <StatCard title="Quotations" value={quotations.toString()} icon={Trophy} trend="Pending" />
      <StatCard title="Converted" value={converted.toString()} icon={Trophy} trend="Closed" />
      <StatCard title="Lost Deals" value={lost.toString()} icon={XCircle} trend="Closed" />
    </div>
  );
}
