import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

export default function SchedulingPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scheduling</h1>
          <p className="text-muted-foreground">
            Create and manage job schedules for your crew.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Job
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Calendar</CardTitle>
          <CardDescription>View and manage scheduled jobs.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>A calendar view for job scheduling will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
