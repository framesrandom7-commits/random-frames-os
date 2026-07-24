import React from "react";
import { getCurrentProfile } from "@/app/actions/user";
import ProfileClient from "./profile-client";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return <div>Unable to load profile.</div>;
  }

  return <ProfileClient profile={profile} />;
}
