import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Generate and export reports for inventory and jobs.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Generate Reports</CardTitle>
          <CardDescription>
            Select a report type to generate and download.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline">
                <Download className="mr-2 h-4 w-4" /> Export Inventory Report
            </Button>
            <Button variant="outline">
                <Download className="mr-2 h-4 w-4" /> Export Job Report
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
