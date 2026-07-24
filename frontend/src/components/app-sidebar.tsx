"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ImagesIcon, MessageCircleIcon } from "lucide-react";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const navigation = [
  {
    title: "Chat",
    href: "/chat",
    icon: MessageCircleIcon,
  },
  {
    title: "Library",
    href: "/",
    icon: ImagesIcon,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="h-(--header-height) justify-center">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="w-fit hover:bg-transparent hover:text-sidebar-foreground active:bg-transparent"
              render={<Link href="/chat" aria-label="Sentinel home" />}
            >
              <span className="text-lg font-semibold tracking-tight">
                Sentinel
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={
                      <Link
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                      />
                    }
                    tooltip={item.title}
                    isActive={isActive}
                  >
                    <Icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <NavUser />
      <SidebarRail />
    </Sidebar>
  );
}
