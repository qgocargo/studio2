"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/layout/Sidebar";
import AppHeader from "@/components/layout/Header";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/logo";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24">
              <Logo />
          </div>
          <h1 className="text-3xl font-bold text-primary font-headline">FieldForce Manager</h1>
          <div className="flex items-center gap-2 mt-4 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading your experience...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // or a redirect component
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-screen bg-muted/40 dark:bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AppHeader />
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
