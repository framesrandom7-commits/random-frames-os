import React, { Suspense } from "react";
import Topbar from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { Camera, Calendar, Clock, CheckCircle2, AlertCircle, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getShoots, getShootStats } from "@/app/actions/shoot";
import { prisma } from "@/lib/prisma";
import ShootTable from "@/components/shoots/shoot-table";
import ShootCalendarView from "@/components/shoots/shoot-calendar-view";
import ShootSearch from "@/components/shoots/shoot-search";
import ShootFilters from "@/components/shoots/shoot-filters";
import ShootViewToggle from "@/components/shoots/shoot-view-toggle";
import { ShootStatus, ShootType } from "@prisma/client";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ShootsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page) : 1;
  const search = typeof searchParams.search === "string" ? searchParams.search : "";
  const status = typeof searchParams.status === "string" ? searchParams.status as ShootStatus : "";
  const shootType = typeof searchParams.shootType === "string" ? searchParams.shootType as ShootType : "";
  const archived = searchParams.archived === "true";
  const sortBy = typeof searchParams.sortBy === "string" ? searchParams.sortBy : "date";
  const sortOrder = searchParams.sortOrder === "desc" ? "desc" : "asc";
  const view = typeof searchParams.view === "string" ? searchParams.view : "list";
  
  // Date params for calendar view
  const dateStart = typeof searchParams.dateStart === "string" ? new Date(searchParams.dateStart) : undefined;
  const dateEnd = typeof searchParams.dateEnd === "string" ? new Date(searchParams.dateEnd) : undefined;

  // We need to fetch without pagination limit if calendar view to get all month shoots
  const limit = view === "calendar" ? 1000 : 50;

  const [shootData, stats, allClients, allProjects] = await Promise.all([
    getShoots({ page, limit, search, status, shootType, archived, sortBy, sortOrder, dateStart, dateEnd }),
    getShootStats(),
    prisma.client.findMany({ select: { id: true, businessName: true }, orderBy: { businessName: 'asc' }, where: { archivedAt: null } }),
    prisma.project.findMany({ select: { id: true, title: true, clientId: true }, orderBy: { title: 'asc' }, where: { archivedAt: null } })
  ]);

  return (
    <>
      <Topbar title="Shoots" />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#050505]">
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <Card className="border-white/10 bg-white/5 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-zinc-400">Today's Shoots</CardTitle>
              <Camera className="h-4 w-4 text-[#C1121F]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.todaysShoots}</div>
            </CardContent>
          </Card>
          
          <Card className="border-white/10 bg-white/5 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-zinc-400">Upcoming (Scheduled)</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{stats.upcomingShoots}</div>
            </CardContent>
          </Card>
          
          <Card className="border-white/10 bg-white/5 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-zinc-400">This Week</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">{stats.thisWeekShoots}</div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-zinc-400">Completed (Month)</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">{stats.completedThisMonth}</div>
            </CardContent>
          </Card>
          
          <Card className="border-white/10 bg-white/5 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-zinc-400">Cancelled</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.cancelledShoots}</div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-zinc-400">Pending Deliveries</CardTitle>
              <Package className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">{stats.pendingDeliveries}</div>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-1 items-center gap-2">
            <ShootSearch />
            <ShootFilters />
            <div className="hidden sm:block ml-2">
              <ShootViewToggle />
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="sm:hidden block">
              <ShootViewToggle />
            </div>
            <Link href={`?new=true`} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-[#C1121F] text-white hover:bg-[#a00f1a] shadow-lg w-full sm:w-auto">
               <Camera className="mr-2 h-4 w-4" /> Schedule Shoot
            </Link>
          </div>
        </div>

        {/* Content View */}
        <Suspense fallback={<div className="h-96 flex items-center justify-center text-zinc-500">Loading shoots...</div>}>
          {view === "list" ? (
            <ShootTable 
              shoots={shootData.shoots as any} 
              clients={allClients}
              projects={allProjects}
              page={shootData.currentPage} 
              totalPages={shootData.totalPages} 
              total={shootData.total} 
            />
          ) : (
            <ShootCalendarView 
              shoots={shootData.shoots as any} 
              clients={allClients}
              projects={allProjects}
            />
          )}
        </Suspense>
      </main>
    </>
  );
}
