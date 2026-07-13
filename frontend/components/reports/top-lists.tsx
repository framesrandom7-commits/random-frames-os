"use client";

import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

const formatCurr = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

export function TopClientsList({ clients }: { clients: any[] }) {
  if (!clients || clients.length === 0) {
    return <div className="p-4 text-center text-sm text-zinc-500">No client data available.</div>;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-white/10 hover:bg-transparent">
          <TableHead className="text-zinc-400">Client</TableHead>
          <TableHead className="text-zinc-400 text-right">Revenue generated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((c) => (
          <TableRow key={c.id} className="border-white/10 hover:bg-white/5 transition-colors group">
            <TableCell>
              <Link href={`/clients/${c.id}`} className="font-medium text-white group-hover:text-[#C1121F] transition-colors flex items-center">
                {c.name}
              </Link>
            </TableCell>
            <TableCell className="text-right text-emerald-400 font-medium">
              {formatCurr(c.total)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function TopProjectsList({ projects }: { projects: any[] }) {
  if (!projects || projects.length === 0) {
    return <div className="p-4 text-center text-sm text-zinc-500">No project data available.</div>;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-white/10 hover:bg-transparent">
          <TableHead className="text-zinc-400">Project</TableHead>
          <TableHead className="text-zinc-400">Client</TableHead>
          <TableHead className="text-zinc-400 text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((p) => (
          <TableRow key={p.id} className="border-white/10 hover:bg-white/5 transition-colors group">
            <TableCell>
              <Link href={`/projects/${p.id}`} className="font-medium text-white group-hover:text-[#C1121F] transition-colors">
                {p.title}
              </Link>
            </TableCell>
            <TableCell className="text-zinc-400 text-sm">{p.clientName}</TableCell>
            <TableCell className="text-right text-white font-medium">
              {formatCurr(p.amount)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function UpcomingDeliveriesList({ deliveries }: { deliveries: any[] }) {
  if (!deliveries || deliveries.length === 0) {
    return <div className="p-4 text-center text-sm text-zinc-500">No upcoming deliveries.</div>;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-white/10 hover:bg-transparent">
          <TableHead className="text-zinc-400">Project</TableHead>
          <TableHead className="text-zinc-400">Client</TableHead>
          <TableHead className="text-zinc-400 text-right">Delivery Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deliveries.map((p) => (
          <TableRow key={p.id} className="border-white/10 hover:bg-white/5 transition-colors group">
            <TableCell>
              <Link href={`/projects/${p.id}`} className="font-medium text-white group-hover:text-[#C1121F] transition-colors">
                {p.title}
              </Link>
            </TableCell>
            <TableCell className="text-zinc-400 text-sm">{p.client.businessName}</TableCell>
            <TableCell className="text-right text-amber-500 font-medium">
              {new Date(p.deliveryDate).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function OverdueInvoicesList({ invoices }: { invoices: any[] }) {
  if (!invoices || invoices.length === 0) {
    return <div className="p-4 text-center text-sm text-zinc-500">No overdue invoices!</div>;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-white/10 hover:bg-transparent">
          <TableHead className="text-zinc-400">Invoice</TableHead>
          <TableHead className="text-zinc-400">Client</TableHead>
          <TableHead className="text-zinc-400 text-right">Balance Due</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((inv) => (
          <TableRow key={inv.id} className="border-white/10 hover:bg-white/5 transition-colors group">
            <TableCell>
              <Link href={`/finance/invoices/${inv.id}`} className="font-medium text-white group-hover:text-[#C1121F] transition-colors flex items-center">
                {inv.invoiceNumber}
              </Link>
            </TableCell>
            <TableCell className="text-zinc-400 text-sm">{inv.clientName}</TableCell>
            <TableCell className="text-right text-red-500 font-bold">
              {formatCurr(inv.balance)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
