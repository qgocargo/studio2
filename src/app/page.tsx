
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { signOut } from "@/lib/actions";
import {
  PanelLeft,
  Home,
  Folder,
  Users,
  LineChart,
  LogOut,
  FilePlus,
  Save,
  Printer,
  Trash2,
  FolderOpen,
  Users2,
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
import Image from "next/image";


async function getUser() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get("__session");

  if (!sessionCookie) {
    return null;
  }

  // In a real app, you would verify the session cookie with the server (e.g., Firebase Admin SDK)
  // and fetch user details from your database.
  // For this prototype, we'll assume the cookie value is the user's UID and return a mock user.
  const user = {
    uid: sessionCookie.value,
    displayName: "Akif Boss", // Replace with actual data fetch later
    role: "admin", // Replace with actual data fetch later
  };

  return user;
}

export default async function HomePage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  // Mock data for status summary. We will fetch this from Firestore later.
  const statusSummary = {
    approved: 125,
    rejected: 12,
    checked: 45,
    pending: 30,
  };

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
                  {statusSummary.approved}
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
                  {statusSummary.rejected}
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
                  {statusSummary.checked}
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
                  {statusSummary.pending}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 sm:p-6">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="flex items-center">
                     <Image 
                        src="http://qgocargo.com/logo.png" 
                        alt="Q'go Cargo Logo" 
                        width={64} 
                        height={64} 
                        className="h-16 w-auto mr-4"
                    />
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 border-l-4 border-gray-300 pl-4">JOB FILE</h1>
                </div>
                <div className="text-right w-full sm:w-auto space-y-2">
                    <div className="flex items-center">
                        <Label htmlFor="date" className="mr-2 font-semibold text-gray-700">Date:</Label>
                        <Input type="date" id="date" className="w-full sm:w-40" />
                    </div>
                    <div className="flex items-center">
                        <Label htmlFor="po-number" className="mr-2 font-semibold text-gray-700">P.O. #:</Label>
                        <Input type="text" id="po-number" className="w-full sm:w-40" />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                    <Label htmlFor="job-file-no" className="block mb-1 font-semibold text-gray-700">Job File No.:</Label>
                    <Input type="text" id="job-file-no" placeholder="Enter a unique ID here..." />
                </div>
                <div className="flex items-end space-x-8 pb-1">
                    <div>
                        <span className="font-semibold text-gray-700">Clearance</span>
                        <div className="mt-2 space-y-1">
                            <div className="flex items-center"><Checkbox id="c-export" /><Label htmlFor="c-export" className="ml-2">Export</Label></div>
                            <div className="flex items-center"><Checkbox id="c-import" /><Label htmlFor="c-import" className="ml-2">Import</Label></div>
                            <div className="flex items-center"><Checkbox id="c-clearance" /><Label htmlFor="c-clearance" className="ml-2">Clearance</Label></div>
                            <div className="flex items-center"><Checkbox id="c-local" /><Label htmlFor="c-local" className="ml-2">Local Move</Label></div>
                        </div>
                    </div>
                    <div>
                        <span className="font-semibold text-gray-700">Product Type</span>
                        <div className="mt-2 space-y-1">
                             <div className="flex items-center"><Checkbox id="p-air" /><Label htmlFor="p-air" className="ml-2">Air Freight</Label></div>
                             <div className="flex items-center"><Checkbox id="p-sea" /><Label htmlFor="p-sea" className="ml-2">Sea Freight</Label></div>
                             <div className="flex items-center"><Checkbox id="p-land" /><Label htmlFor="p-land" className="ml-2">Land Freight</Label></div>
                             <div className="flex items-center"><Checkbox id="p-others" /><Label htmlFor="p-others" className="ml-2">Others</Label></div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div><Label htmlFor="invoice-no" className="block mb-1 font-semibold text-gray-700">Invoice No.:</Label><Input type="text" id="invoice-no" /></div>
                <div><Label htmlFor="billing-date" className="block mb-1 font-semibold text-gray-700">Billing Date:</Label><Input type="date" id="billing-date" /></div>
                <div><Label htmlFor="salesman" className="block mb-1 font-semibold text-gray-700">Salesman:</Label><Input type="text" id="salesman" /></div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <Label htmlFor="shipper-name" className="block mb-1 font-semibold text-gray-700">Shipper's Name:</Label>
                    <Input type="text" id="shipper-name" />
                </div>
                <div>
                    <Label htmlFor="consignee-name" className="block mb-1 font-semibold text-gray-700">Consignee's Name:</Label>
                    <Input type="text" id="consignee-name" />
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div><Label htmlFor="mawb" className="block mb-1 font-semibold text-gray-700">MAWB / OBL / TCN No.:</Label><Input type="text" id="mawb" /></div>
                <div><Label htmlFor="hawb" className="block mb-1 font-semibold text-gray-700">HAWB / HBL:</Label><Input type="text" id="hawb" /></div>
                <div><Label htmlFor="teams-of-shipping" className="block mb-1 font-semibold text-gray-700">Teams of Shipping:</Label><Input type="text" id="teams-of-shipping" /></div>
                <div><Label htmlFor="origin" className="block mb-1 font-semibold text-gray-700">Origin:</Label><Input type="text" id="origin" /></div>
                <div><Label htmlFor="no-of-pieces" className="block mb-1 font-semibold text-gray-700">No. of Pieces:</Label><Input type="text" id="no-of-pieces" /></div>
                <div><Label htmlFor="gross-weight" className="block mb-1 font-semibold text-gray-700">Gross Weight:</Label><Input type="text" id="gross-weight" /></div>
                <div><Label htmlFor="destination" className="block mb-1 font-semibold text-gray-700">Destination:</Label><Input type="text" id="destination" /></div>
                <div><Label htmlFor="volume-weight" className="block mb-1 font-semibold text-gray-700">Volume Weight:</Label><Input type="text" id="volume-weight" /></div>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="sm:col-span-2">
                    <Label htmlFor="description" className="block mb-1 font-semibold text-gray-700">Description:</Label>
                    <Input type="text" id="description" />
                </div>
                <div><Label htmlFor="carrier" className="block mb-1 font-semibold text-gray-700">Carrier / Shipping Line / Trucking Co:</Label><Input type="text" id="carrier" /></div>
                <div><Label htmlFor="truck-no" className="block mb-1 font-semibold text-gray-700">Truck No. / Driver's Name:</Label><Input type="text" id="truck-no" /></div>
                <div><Label htmlFor="vessel-name" className="block mb-1 font-semibold text-gray-700">Vessel's Name:</Label><Input type="text" id="vessel-name" /></div>
                <div><Label htmlFor="flight-voyage-no" className="block mb-1 font-semibold text-gray-700">Flight / Voyage No.:</Label><Input type="text" id="flight-voyage-no" /></div>
                <div><Label htmlFor="container-no" className="block mb-1 font-semibold text-gray-700">Container No.:</Label><Input type="text" id="container-no" /></div>
            </div>
            
            <div className="flex justify-between items-center mb-2">
                 <h2 className="text-xl font-semibold text-gray-800">Charges</h2>
                 <div>
                     <Button variant="outline" size="sm">Manage Descriptions</Button>
                     <Button variant="default" size="sm" className="ml-2">Suggest Charges ✨</Button>
                 </div>
            </div>

            <div className="mb-6 overflow-x-auto border border-gray-200 rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-2/5">Description</TableHead>
                            <TableHead>Cost</TableHead>
                            <TableHead>Selling</TableHead>
                            <TableHead>Profit</TableHead>
                            <TableHead>Notes</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* Dynamic rows will go here */}
                         <TableRow>
                            <TableCell><Input placeholder="Charge description..." /></TableCell>
                            <TableCell><Input type="number" placeholder="0.00" /></TableCell>
                            <TableCell><Input type="number" placeholder="0.00" /></TableCell>
                            <TableCell className="text-right">0.000</TableCell>
                            <TableCell><Input placeholder="Notes..." /></TableCell>
                            <TableCell><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
                        </TableRow>
                    </TableBody>
                     <TableFooter>
                        <TableRow className="bg-muted/50 font-bold">
                            <TableCell className="text-right">TOTAL:</TableCell>
                            <TableCell className="text-right">0.000</TableCell>
                            <TableCell className="text-right">0.000</TableCell>
                            <TableCell className="text-right text-green-600">0.000</TableCell>
                            <TableCell colSpan={2}></TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
             <div className="text-right mb-6">
                 <Button variant="outline" size="sm">+ Add Charge</Button>
            </div>

            <div className="flex justify-between items-center mb-2">
                <Label htmlFor="remarks" className="block font-semibold text-gray-700">REMARKS:</Label>
                 <Button variant="default" size="sm">Generate Remarks ✨</Button>
            </div>
            <div className="mb-8">
                <Textarea id="remarks" rows={4} />
            </div>

            <footer className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t items-end">
                <div><Label className="block mb-2 font-semibold text-gray-700">PREPARED BY</Label><Input type="text" id="prepared-by" readOnly value={user.displayName} /></div>
                <div>
                    <Label className="block mb-2 font-semibold text-gray-700">CHECKED BY</Label>
                    <Input type="text" id="checked-by" readOnly />
                </div>
                <div>
                    <Label className="block mb-2 font-semibold text-gray-700">APPROVED BY</Label>
                    <Input type="text" id="approved-by" readOnly />
                </div>
            </footer>

            <div className="text-center mt-10 flex flex-wrap justify-center gap-2 sm:gap-4">
                 <Button variant="secondary"><Users2 />Clients</Button>
                 <Button variant="secondary"><FolderOpen />File Manager</Button>
                 <Button className="bg-green-600 hover:bg-green-700"><Save />Save to DB</Button>
                 <Button variant="outline"><FilePlus />New Job</Button>
                 <Button className="bg-indigo-600 hover:bg-indigo-700"><Printer />Print</Button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
