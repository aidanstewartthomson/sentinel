import type { CSSProperties } from "react";
import { auth } from "@clerk/nextjs/server";

import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await auth.protect();

  return (
    <TooltipProvider>
      <SidebarProvider
        className="h-dvh overflow-hidden md:p-2 md:pl-0"
        style={
          {
            "--sidebar-width": "16rem",
            "--header-height": "3.5rem",
          } as CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset className="min-h-0 min-w-0 flex-1 overflow-hidden md:m-0!">
          <AppHeader />
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
