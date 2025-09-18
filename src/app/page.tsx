
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/firebase/firebase";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import { JobFileForm } from "./job-file-form";
import { Toaster } from "@/components/ui/toaster";


async function getDashboardData() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get("__session");

  if (!sessionCookie) {
    return { user: null, statusSummary: null };
  }
  
  const uid = sessionCookie.value;
  let user = null;
  let statusSummary = {
    approved: 0,
    rejected: 0,
    checked: 0,
    pending: 0,
  };

  try {
     // Fetch user data
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      user = {
        uid,
        displayName: userDoc.data().displayName || 'No Name',
        role: userDoc.data().role || 'user',
      };
    } else {
       // If user doc doesn't exist, create a mock one but log the issue
      console.warn(`User document not found for UID: ${uid}. Using default values.`);
      user = { uid, displayName: "New User", role: "user" };
    }

    // Fetch job files to calculate status summary
    const jobfilesCollection = collection(db, "jobfiles");
    const jobfilesSnapshot = await getDocs(jobfilesCollection);
    
    jobfilesSnapshot.forEach((jobfileDoc) => {
      const status = jobfileDoc.data().status?.toLowerCase();
      if (status && status in statusSummary) {
        statusSummary[status as keyof typeof statusSummary]++;
      }
    });

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    // Return default/empty values in case of error, but keep user logged in if they have a cookie
    if (!user && uid) {
      user = { uid, displayName: "Error Loading User", role: "user" };
    }
  }


  return { user, statusSummary };
}

export default async function HomePage() {
  const { user, statusSummary } = await getDashboardData();

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
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <Card className="bg-green-100 border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-900">
                  Approved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">
                  {statusSummary?.approved}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-red-100 border-red-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-900">
                  Rejected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-900">
                  {statusSummary?.rejected}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-blue-100 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-900">
                  Checked
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">
                  {statusSummary?.checked}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-yellow-100 border-yellow-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-yellow-900">
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-900">
                  {statusSummary?.pending}
                </div>
              </CardContent>
            </Card>
          </div>
          <JobFileForm user={user} />
        </main>
        <Toaster />
      </div>
    </div>
  );
}
