import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function RecentLeads() {
  const leads = [
    { id: 1, name: "Alice Johnson", email: "alice@example.com", status: "New", date: "Today" },
    { id: 2, name: "Bob Smith", email: "bob@example.com", status: "Contacted", date: "Yesterday" },
    { id: 3, name: "Charlie Davis", email: "charlie@example.com", status: "Qualified", date: "2 days ago" },
    { id: 4, name: "Diana Prince", email: "diana@example.com", status: "Proposal", date: "3 days ago" },
  ];

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-lg h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">Recent Leads</CardTitle>
      </CardHeader>
      <CardContent>
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
              <TableRow key={lead.id} className="border-white/10 hover:bg-white/5 transition-colors">
                <TableCell className="font-medium text-zinc-300">
                  {lead.name}
                  <div className="text-xs text-zinc-500 font-normal">{lead.email}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-zinc-700 text-zinc-300 bg-zinc-900/50">
                    {lead.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-zinc-500">{lead.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
