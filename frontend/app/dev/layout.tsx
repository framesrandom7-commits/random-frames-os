import { notFound } from "next/navigation";
import { TopBar } from "@/components/layout/top-bar";
import AppShell from "@/components/layout/app-shell";

export default function DevLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  // Provide a minimal authenticated-like shell for the dev playground
  const mockUser = {
    id: "dev",
    name: "Developer",
    email: "dev@randomframes.com",
    role: "ADMIN" as const,
    roleName: "Developer",
  };

  return (
    <AppShell user={mockUser}>
      <TopBar user={mockUser} />
      {children}
    </AppShell>
  );
}
