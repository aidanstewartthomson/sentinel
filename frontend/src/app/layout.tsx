import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sentinel",
  description: "AI-powered visual intelligence platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <SidebarProvider
              style={
                {
                  "--sidebar-width": "16rem",
                  "--header-height": "3.5rem",
                } as CSSProperties
              }
            >
              <AppSidebar variant="inset" />
              <SidebarInset className="min-w-0 overflow-x-hidden">
                <header className="flex h-(--header-height) min-w-0 shrink-0 items-center border-b transition-[width,height] ease-linear">
                  <div className="flex w-full min-w-0 items-center gap-1 px-4 lg:gap-2 lg:px-6">
                    <SidebarTrigger className="-ml-1" />
                    <Separator
                      orientation="vertical"
                      className="mx-2 data-vertical:h-4 data-vertical:self-auto"
                    />
                    <span className="truncate text-sm font-medium">Library</span>
                  </div>
                </header>
                {children}
              </SidebarInset>
            </SidebarProvider>
          </TooltipProvider>
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
