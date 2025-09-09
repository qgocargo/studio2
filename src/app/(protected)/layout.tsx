"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/layout/Sidebar";
import AppHeader from "@/components/layout/Header";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/logo";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (userProfile?.status !== 'approved') {
        let message = 'Your account is pending approval.';
        if (userProfile?.status === 'rejected') {
          message = 'Your account has been rejected.';
        } else if(userProfile?.status === 'pending') {
          message = 'Your account is pending approval by an administrator.'
        }
        toast({ title: 'Access Denied', description: message, variant: 'destructive' });
        router.replace("/login");
      }
    }
  }, [user, userProfile, loading, router, toast]);

  if (loading || !user || userProfile?.status !== 'approved') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Logo className="h-24 w-24" />
          <div className="flex items-center gap-2 mt-4 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Authenticating...</span>
          </div>
        </div>
      </div>
    );
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
