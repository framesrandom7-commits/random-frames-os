import React from "react";
import StatCard from "@/components/dashboard/stat-card";
import { Users, UserPlus, PhoneForwarded, Trophy, XCircle } from "lucide-react";
import { Lead, LeadStatus } from "@prisma/client";

export default function LeadStats({ leads }: { leads: Lead[] }) {
  const total = leads.length;
  const newLeads = leads.filter(l => l.status === LeadStatus.NEW).length;
  const followUps = leads.filter(l => l.status === LeadStatus.FOLLOW_UP).length;
  const won = leads.filter(l => l.status === LeadStatus.WON).length;
  const lost = leads.filter(l => l.status === LeadStatus.LOST).length;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
      <StatCard title="Total Leads" value={total.toString()} icon={Users} trend="All time" />
      <StatCard title="New Leads" value={newLeads.toString()} icon={UserPlus} trend="Needs action" />
      <StatCard title="Follow Ups" value={followUps.toString()} icon={PhoneForwarded} trend="Scheduled" />
      <StatCard title="Won Deals" value={won.toString()} icon={Trophy} trend="Converted" />
      <StatCard title="Lost Deals" value={lost.toString()} icon={XCircle} trend="Closed" />
    </div>
  );
}
