
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PanelLeft, Home, Folder, Users, LineChart, LogOut } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/firebase/firebase";
import { signOut } from "@/lib/actions";


export default async function HomePage() {
  const user = auth.currentUser;

  // This is a temporary check. In a real app, you'd use server-side sessions
  // or a more robust authentication check. For now, if there's no user object,
  // we assume they are not logged in.
  // Note: This check only works on server-side rendering.
  // We will need a more robust solution with middleware for client-side navigation.
  if (!user) {
    // redirect("/login");
  }


  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-60 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <a
            href="#"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Logo className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">Job File System</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
            title="Dashboard"
          >
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            title="Files"
          >
            <Folder className="h-4 w-4" />
            <span>File Manager</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            title="Users"
          >
            <Users className="h-4 w-4" />
            <span>Users</span>
          </a>
           <a
            href="#"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            title="Clients"
          >
            <Users className="h-4 w-4" />
            <span>Clients</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            title="Analytics"
          >
            <LineChart className="h-4 w-4" />
            <span>Analytics</span>
          </a>
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
           <form action={signOut}>
            <button type="submit" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary" title="Logout">
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
                <a
                  href="#"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                >
                  <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
                  <span className="sr-only">Job File System</span>
                </a>
                 <a
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </a>
                <a
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Folder className="h-5 w-5" />
                  File Manager
                </a>
                <a
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Users className="h-5 w-5" />
                  Users
                </a>
                 <a
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Users className="h-5 w-5" />
                  Clients
                </a>
                <a
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <LineChart className="h-5 w-5" />
                  Analytics
                </a>
                 <a
                  href="#"
                  className="mt-auto flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </a>
              </nav>
            </SheetContent>
          </Sheet>
           <div className="relative ml-auto flex-1 md:grow-0">
             <h1 className="text-xl font-semibold">Dashboard</h1>
          </div>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div className="flex items-center justify-center rounded-lg border border-dashed shadow-sm h-[80vh]">
              <div className="flex flex-col items-center gap-1 text-center">
                <h3 className="text-2xl font-bold tracking-tight">
                  Welcome to your new app!
                </h3>
                <p className="text-sm text-muted-foreground">
                  The great migration from a single HTML file to Next.js components has begun.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
