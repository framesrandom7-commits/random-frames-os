import React from "react";
import AppShell from "@/components/layout/app-shell";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();
  
  let user = { name: "User", roleName: "Viewer" };
  if (session) {
    const userRecord = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { role: true }
    });
    if (userRecord) {
      user = {
        name: userRecord.name || "User",
        roleName: userRecord.role?.name || "Viewer"
      };
    }
  }

  return <AppShell user={user}>{children}</AppShell>;
}
