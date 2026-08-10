import React from "react";
import { TopBar } from "@/components/layout/top-bar";
import { AppLayout, AppLayoutWindow, AppLayoutContent } from "./responsive/app-layout";
import { PageContainer } from "./responsive/page-container";
import { NavigationProvider } from "@/components/navigation/navigation-context";
import { NavigationLayoutResolver } from "@/components/navigation/navigation-layout-resolver";
import { WelcomeScreen } from "@/components/layout/welcome-screen";

import { GlobalModals } from "@/components/layout/global-modals";

export default function AppShell({ children, user }: { children: React.ReactNode, user?: { name: string, roleName: string } }) {
  return (
    <AppLayout>
      <WelcomeScreen user={user} />
      <NavigationProvider>
        <AppLayoutWindow>
          <NavigationLayoutResolver />
          <AppLayoutContent>
            <TopBar user={user} />
            <PageContainer>
              {children}
            </PageContainer>
            <React.Suspense fallback={null}>
              <GlobalModals />
            </React.Suspense>
          </AppLayoutContent>
        </AppLayoutWindow>
      </NavigationProvider>
    </AppLayout>
  );
}
