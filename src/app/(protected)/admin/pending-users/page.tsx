"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { approveUser, getUsers, rejectUser } from "@/lib/actions";
import { Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PendingUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const fetchedUsers = await getUsers();
    setUsers(fetchedUsers);
    setLoading(false);
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (uid: string, role: UserProfile['role']) => {
    const result = await approveUser(uid, role);
    if (result.success) {
      setUsers(users.map(user => user.uid === uid ? { ...user, status: 'approved', role } : user));
      toast({
        title: "User Approved",
        description: `The user has been approved as a ${role}.`,
      });
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };

  const handleReject = async (uid: string) => {
    const result = await rejectUser(uid);
    if (result.success) {
      setUsers(users.map(user => user.uid === uid ? { ...user, status: 'rejected' } : user));
      toast({
        title: "User Rejected",
        description: "The user will not be able to log in.",
        variant: "destructive"
      });
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : pendingUsers.length > 0 ? pendingUsers.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.createdAt?.toDate().toLocaleDateString() || 'N/A'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm">Approve As...</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleApprove(user.uid, 'user')}>User</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleApprove(user.uid, 'supervisor')}>Supervisor</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleApprove(user.uid, 'admin')}>Admin</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : otherUsers.length > 0 ? otherUsers.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'approved' ? 'default' : 'destructive'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">No reviewed users yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
