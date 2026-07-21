"use client";

import { UserButton } from "@clerk/nextjs";

import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavUser() {
  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem className="min-w-0 overflow-hidden">
          <UserButton
            showName
            appearance={{
              elements: {
                rootBox: {
                  width: "100%",
                  minWidth: 0,
                },
                userButtonTrigger: {
                  width: "100%",
                  height: "3rem",
                  padding: "0.5rem",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  "&:hover": {
                    backgroundColor: "var(--sidebar-accent)",
                    color: "var(--sidebar-accent-foreground)",
                  },
                },
                userButtonBox: {
                  width: "100%",
                  minWidth: 0,
                  flexDirection: "row-reverse",
                  justifyContent: "flex-end",
                  overflow: "hidden",
                },
                userButtonOuterIdentifier: {
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                },
              },
            }}
          />
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
