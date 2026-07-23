"use client";

import { usePathname } from "next/navigation";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

const routeTitles = {
  "/": "Library",
  "/chat": "Chat",
} as const;

export function AppHeader() {
  const pathname = usePathname();
  const title =
    routeTitles[pathname as keyof typeof routeTitles] ?? "Sentinel";

  return (
    <header className="flex h-(--header-height) min-w-0 shrink-0 items-center border-b transition-[width,height] ease-linear">
      <div className="flex w-full min-w-0 items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-vertical:h-4 data-vertical:self-auto"
        />
        <span className="truncate text-sm font-medium">{title}</span>
      </div>
    </header>
  );
}
