"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { AdminUser } from "@/lib/actions/adminUserApi";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { UserActions } from "./user-actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UsersTableProps {
    users: AdminUser[];
    loading: boolean;
    onUserUpdated: () => void;
}

export function UsersTable({ users, loading, onUserUpdated }: UsersTableProps) {
    // Safety check just in case
    const safeUsers = Array.isArray(users) ? users : [];

    if (loading) {
        return (
            <div className="w-full h-48 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        );
    }

    if (safeUsers.length === 0) {
        return (
            <div className="w-full h-48 flex items-center justify-center text-gray-500">
                No users found.
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {safeUsers.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{user.name}</span>
                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="capitalize">
                                    {user.roles?.[0] || user.role || 'user'}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant={user.status === 'SUSPENDED' ? "destructive" : "default"}>
                                    {user.status || 'ACTIVE'}
                                </Badge>
                            </TableCell>
                            <TableCell>{format(new Date(user.createdAt), "MMM d, yyyy")}</TableCell>
                            <TableCell className="text-right">
                                <UserActions user={user} onUserUpdated={onUserUpdated} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
