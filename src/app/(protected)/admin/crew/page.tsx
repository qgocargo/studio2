import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

export default function CrewPage() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Crew Members</CardTitle>
          <CardDescription>Add, edit, and assign roles to your crew.</CardDescription>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Crew Member
        </Button>
      </CardHeader>
      <CardContent>
        <p>A table for managing crew members will be implemented here.</p>
      </CardContent>
    </Card>
  );
}
