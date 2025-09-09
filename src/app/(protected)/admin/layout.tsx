"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactNode } from "react";

const adminTabs = [
    { name: "Pending Users", href: "/admin/pending-users" },
    { name: "Crew Management", href: "/admin/crew" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
                <p className="text-muted-foreground">
                    Manage users, crew, and system settings.
                </p>
            </div>
            
            <Tabs value={pathname} className="w-full">
                <TabsList>
                    {adminTabs.map((tab) => (
                        <Link key={tab.href} href={tab.href} passHref>
                            <TabsTrigger value={tab.href}>{tab.name}</TabsTrigger>
                        </Link>
                    ))}
                </TabsList>
            </Tabs>
            
            <div className="mt-4">
                {children}
            </div>
        </div>
    );
}
