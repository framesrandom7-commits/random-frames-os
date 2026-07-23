import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getLeads } from "@/app/actions/lead";
import { formatDistanceToNow } from "date-fns";
import StatusBadge from "@/components/leads/status-badge";
import Link from "next/link";

export default async function RecentLeads() {
  const { leads } = await getLeads({ limit: 5 });

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-lg h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-white">Recent Leads</CardTitle>
        <Link href="/leads" className="text-sm text-zinc-400 hover:text-white transition-colors">View All</Link>
      </CardHeader>
      <CardContent>
        {leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-zinc-500 text-sm">No leads found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-zinc-400">Name</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400 text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id} className="border-white/10 hover:bg-white/5 transition-colors cursor-pointer">
                  <TableCell className="font-medium text-zinc-300">
                    <Link href={`/leads/${lead.id}`} className="block h-full w-full">
                      {lead.businessName}
                      <div className="text-xs text-zinc-500 font-normal mt-0.5">{lead.contactPerson || lead.email || "No contact info"}</div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell className="text-right text-zinc-500 text-sm">
                    {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
