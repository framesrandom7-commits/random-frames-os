import React from "react";
import StatCard from "@/components/dashboard/stat-card";
import { Users, UserPlus, PhoneForwarded, Trophy, XCircle } from "lucide-react";
import { Lead, LeadStatus } from "@prisma/client";

export default function LeadStats({ leads }: { leads: Lead[] }) {
  const total = leads.length;
  const newLeads = leads.filter(l => l.status === LeadStatus.NEW).length;
  const attendedLeads = leads.filter(l => l.status === "CONTACTED").length;
  const negotiationLeads = leads.filter(l => l.status === "QUOTE_SENT" || l.status === "QUOTE_APPROVED").length;
  const wonLeads = leads.filter(l => l.status === "CONVERTED").length;
  const lostLeads = leads.filter(l => l.status === "LOST").length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <StatCard title="Total Leads" value={total.toString()} icon={Users} trend="All time" />
      <StatCard title="New Leads" value={newLeads.toString()} icon={UserPlus} trend="Needs action" />
      <StatCard title="Attended" value={attendedLeads.toString()} icon={PhoneForwarded} trend="Discussing" />
      <StatCard title="Quotations" value={negotiationLeads.toString()} icon={Trophy} trend="Pending" />
      <StatCard title="Converted" value={wonLeads.toString()} icon={Trophy} trend="Closed" />
      <StatCard title="Lost Deals" value={lostLeads.toString()} icon={XCircle} trend="Closed" />
    </div>
  );
}
