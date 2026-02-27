"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { UserActions } from "@/components/admin/user-actions";

interface User {
    _id: string;
    customId: number;
    name: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
      try {
          const res = await fetch('/api/admin/users'); // We need a GET endpoint for this too, or use server action
          // Since we previously implemented page as Server Component fetching DB directly, 
          // to make it interactive with Client Component state (for block button), 
          // we either need a GET API or pass data from Server Component to Client Component.
          // Let's create a GET API at /api/admin/users/route.ts first or refactor.
          // For simplicity/speed in this context, I will create the GET route quickly in next step 
          // and assume it exists here.
          if (res.ok) {
              const data = await res.json();
              setUsers(data);
          }
      } catch (error) {
          console.error(error);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
     fetchUsers();
  }, []);

  const handleStatusChange = async (userId: string, newStatus: string) => {
      try {
          const res = await fetch(`/api/admin/users/${userId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: newStatus })
          });
          if (res.ok) {
              fetchUsers(); // Refresh list
          }
      } catch (error) {
          console.error("Failed to update status", error);
      }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Manage Users</h2>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>UID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell className="font-medium">{user.customId}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                    <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                        {user.role}
                    </Badge>
                </TableCell>
                <TableCell>
                     <Badge variant={user.status === 'blocked' ? 'destructive' : 'outline'}>
                        {user.status || 'active'}
                    </Badge>
                </TableCell>
                <TableCell>
                     {user.status === 'blocked' ? (
                         <Button variant="outline" size="sm" onClick={() => handleStatusChange(user._id, 'active')}>
                             Unblock
                         </Button>
                     ) : (
                         <Button variant="destructive" size="sm" onClick={() => handleStatusChange(user._id, 'blocked')}>
                             Block
                         </Button>
                     )}
                     <div className="inline-block ml-2">
                        <UserActions id={user._id.toString()} />
                     </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
