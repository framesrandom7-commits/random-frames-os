import React from "react";
import LandingPage from "@/components/auth/landing-page";
import WorkspacePage from "@/components/workspace/workspace-page";

export const dynamic = "force-dynamic";

export default async function Home() {
  // TODO: Authentication integration will be implemented in a dedicated future phase.
  // We leave this root route ready for future authentication integration without placeholder files.

  // The Workspace accepts a `user` object as a prop instead of deciding how authentication works.
  const user = { firstName: "Savan" };
  const isAuthenticated = true;

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return <WorkspacePage user={user} />;
}
//
