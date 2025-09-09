"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Package,
  Calendar,
  Users,
  FileText,
  PanelLeft,
  Settings,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/components/logo";
import { Button } from "../ui/button";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/scheduling", label: "Scheduling", icon: Calendar },
  { href: "/reports", label: "Reports", icon: FileText },
];

const adminMenuItems = [
  { href: "/admin/pending-users", label: "Approvals", icon: Users },
  { href: "/admin/crew", label: "Crew", icon: Users },
]

export default function AppSidebar() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  const isMenuItemActive = (href: string) => {
    if (href === '/dashboard') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <Sidebar collapsible="icon" side="left" variant="sidebar">
      <SidebarHeader className="border-b">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Logo className="h-8 w-8" />
          <span className="text-xl font-headline">FieldForce</span>
        </Link>
        <div className="group-data-[collapsible=icon]:hidden">
           {/* Placeholder for future trigger */}
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref>
                <SidebarMenuButton
                  isActive={isMenuItemActive(item.href)}
                  tooltip={item.label}
                  className="justify-start"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
          {isAdmin && (
             <SidebarMenuItem>
                <Link href="/admin/pending-users" passHref>
                    <SidebarMenuButton
                    isActive={isMenuItemActive('/admin')}
                    tooltip="Admin"
                    className="justify-start bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-red-400 hover:bg-destructive/20 dark:hover:bg-destructive/30"
                    >
                    <Settings className="h-5 w-5" />
                    <span>Admin</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 border-t">
        {/* Can add elements to footer here */}
      </SidebarFooter>
    </Sidebar>
  );
}
