import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PendingUsersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending User Registrations</CardTitle>
        <CardDescription>Approve or reject new user requests.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>A table of pending users with approve/reject actions will be implemented here.</p>
      </CardContent>
    </Card>
  );
}
