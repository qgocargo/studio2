"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from "@/types";
import { Timestamp } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";

const initialPendingUsers: UserProfile[] = [
  { uid: 'user-1', name: 'Alice Johnson', email: 'alice@example.com', role: 'user', status: 'pending', createdAt: Timestamp.now() },
  { uid: 'user-2', name: 'Bob Williams', email: 'bob@example.com', role: 'user', status: 'pending', createdAt: Timestamp.now() },
  { uid: 'user-3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'user', status: 'rejected', createdAt: Timestamp.now() },
];

export default function PendingUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>(initialPendingUsers);

  const handleApprove = (uid: string) => {
    setUsers(users.map(user => user.uid === uid ? { ...user, status: 'approved' } : user));
    toast({
      title: "User Approved",
      description: "The user can now log in to the application.",
    });
  };

  const handleReject = (uid: string) => {
    setUsers(users.map(user => user.uid === uid ? { ...user, status: 'rejected' } : user));
    toast({
      title: "User Rejected",
      description: "The user will not be able to log in.",
      variant: "destructive"
    });
  };

  const pendingUsers = users.filter(u => u.status === 'pending');
  const otherUsers = users.filter(u => u.status !== 'pending');


  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Pending User Registrations</CardTitle>
          <CardDescription>Approve or reject new user requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Requested On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingUsers.length > 0 ? pendingUsers.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.createdAt.toDate().toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" onClick={() => handleApprove(user.uid)}>Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleReject(user.uid)}>Reject</Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">No pending user requests.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Reviewed Users</CardTitle>
          <CardDescription>Users who have already been approved or rejected.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {otherUsers.length > 0 ? otherUsers.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'approved' ? 'default' : 'destructive'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24">No reviewed users yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
