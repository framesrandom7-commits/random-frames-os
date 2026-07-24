import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClients } from "@/app/actions/client";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { UserCircle } from "lucide-react";

export default async function RecentClients() {
  const response = await getClients({ limit: 5, sortBy: "createdAt", sortOrder: "desc" });
  const clients = 'clients' in response ? response.clients : [];

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-lg h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold text-white">Recent Clients</CardTitle>
        <Link href="/clients" className="text-sm text-zinc-400 hover:text-white transition-colors">View All</Link>
      </CardHeader>
      <CardContent className="space-y-3 pt-2">
        {clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-zinc-500 text-sm">No clients found.</p>
          </div>
        ) : (
          clients.map((client) => (
            <Link key={client.id} href={`/clients/${client.id}`} className="block">
              <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-zinc-900/50 p-3 transition-colors hover:bg-white/5 hover:border-white/20">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400">
                  <UserCircle className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-zinc-200 truncate">{client.businessName}</h4>
                  <div className="text-xs text-zinc-500 truncate">{client.contactPerson || client.email || "No contact info"}</div>
                </div>
                <div className="text-xs text-zinc-600 whitespace-nowrap">
                  {formatDistanceToNow(new Date(client.createdAt), { addSuffix: true })}
                </div>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
