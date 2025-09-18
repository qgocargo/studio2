
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { signOut } from "@/lib/actions";
import {
  PanelLeft,
  Home,
  Folder,
  Users,
  LineChart,
  LogOut,
} from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuth } from "firebase-admin/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { initAdminApp } from "@/lib/firebase/firebase-admin";
import Dashboard from "./dashboard";


async function getUser() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get("__session");

  if (!sessionCookie) {
    return null;
  }

  await initAdminApp();

  try {
    const decodedClaims = await getAuth().verifySessionCookie(sessionCookie.value, true);
    const userDoc = await getAuth().getUser(decodedClaims.uid);

    return {
      uid: decodedClaims.uid,
      displayName: userDoc.displayName || 'No Name',
      role: (userDoc.customClaims?.role as string) || 'user',
    };
  } catch (error) {
    console.error("Error verifying session cookie:", error);
    // If cookie is invalid, redirect to login, but clear the cookie first.
    // The redirect will be caught by the middleware, but it's good practice.
    cookies().delete("__session");
    return null;
  }
}

export default async function HomePage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-60 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="#"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Logo className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">Job File System</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
            title="Dashboard"
          >
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            title="Files"
          >
            <Folder className="h-4 w-4" />
            <span>File Manager</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            title="Clients"
          >
            <Users className="h-4 w-4" />
            <span>Clients</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            title="Analytics"
          >
            <LineChart className="h-4 w-4" />
            <span>Analytics</span>
          </Link>
          {user.role === "admin" && (
            <Link
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              title="Admin Panel"
            >
              <Users className="h-4 w-4" />
              <span>Admin Panel</span>
            </Link>
          )}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </form>
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="#"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                >
                  <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
                  <span className="sr-only">Job File System</span>
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-foreground"
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Folder className="h-5 w-5" />
                  File Manager
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Users className="h-5 w-5" />
                  Clients
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <LineChart className="h-5 w-5" />
                  Analytics
                </Link>
                {user.role === "admin" && (
                  <Link
                    href="#"
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <Users className="h-5 w-5" />
                    Admin Panel
                  </Link>
                )}
                <form action={signOut} className="mt-auto">
                  <button
                    type="submit"
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </form>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-right">
              Logged in as:{" "}
              <span className="font-bold">{user.displayName}</span> (
              <span className="capitalize">{user.role}</span>)
            </div>
            {user.role === "admin" && (
              <>
                <Button variant="outline" size="sm">
                  Activity Log
                </Button>
              </>
            )}
          </div>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
           <Dashboard user={user} />
        </main>
      </div>
    </div>
  );
}
