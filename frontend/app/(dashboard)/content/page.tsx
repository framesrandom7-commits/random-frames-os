import React from "react";
import { getContentPlans } from "@/app/actions/content";
import { prisma } from "@/lib/prisma";
import { ContentManager } from "@/components/content/content-manager";

export const dynamic = "force-dynamic";

export default async function ContentPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page) : 1;
  const search = typeof searchParams.search === "string" ? searchParams.search : "";
  
  const [contentData, allProjects] = await Promise.all([
    getContentPlans({ page, limit: 50, search }),
    prisma.project.findMany({ select: { id: true, title: true }, orderBy: { createdAt: "desc" }, where: { archivedAt: null } })
  ]);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      <ContentManager 
        data={contentData.content as any[]} 
        allProjects={allProjects} 
      />
    </div>
  );
}
