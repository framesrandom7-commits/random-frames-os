import React from "react";
import LandingPage from "@/components/auth/landing-page";
import WorkspacePage from "@/components/workspace/workspace-page";

import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await verifySession();

  if (!session) {
    return <LandingPage />;
  }

  const userRecord = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { role: true }
  });

  if (!userRecord) {
    return <LandingPage />; // Or handle error
  }

  const user = { 
    name: userRecord.name || "User",
    roleName: userRecord.role?.name || "Viewer"
  };

  return <WorkspacePage user={user} />;
}

