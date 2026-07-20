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
        <SidebarMenuItem>
          <UserButton
            showName
            appearance={{
              elements: {
                rootBox: {
                  width: "100%",
                },
                userButtonTrigger: {
                  width: "100%",
                  height: "3rem",
                  padding: "0.5rem",
                  borderRadius: "var(--radius-md)",
                  "&:hover": {
                    backgroundColor: "var(--sidebar-accent)",
                    color: "var(--sidebar-accent-foreground)",
                  },
                },
                userButtonBox: {
                  width: "100%",
                  flexDirection: "row-reverse",
                  justifyContent: "flex-end",
                },
              },
            }}
          />
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
