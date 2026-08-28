"use client";

import React from "react";
import { ModulePage, ModuleDataView, ModulePagination } from "@/components/ui/module";
import { clientConfig } from "./client-config";
import { Client } from "@prisma/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export interface ClientsModuleClientProps {
  data: Client[];
  total: number;
  stats: any;
  currentView: string;
  currentPage: number;
  totalPages: number;
}

export function ClientsModuleClient({ 
  data, 
  total, 
  stats, 
  currentView,
  currentPage,
  totalPages
}: ClientsModuleClientProps) {
  const router = useRouter();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <ModulePage 
      title="Clients"
      primaryAction={
        <Link href="?new=client">
          <Button className="bg-[#C1121F] text-white hover:bg-[#a00f1a]">
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        </Link>
      }
      config={clientConfig} 
      stats={stats}
      currentView={currentView}
    >
      <ModuleDataView
        data={data}
        columns={clientConfig.columns}
        cardRender={clientConfig.cardRender}
        getRowId={(client) => client.id}
        bulkActions={clientConfig.bulkActions}
        onRowClick={(client) => router.push(`/clients/${client.id}`)}
      />
      {totalPages > 1 && (
        <div className="mt-4">
          <ModulePagination totalCount={total} />
        </div>
      )}
    </ModulePage>
  );
}
