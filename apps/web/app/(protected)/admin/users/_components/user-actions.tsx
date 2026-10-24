"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminUser, deleteUser, reactivateUser, suspendUser } from "@/lib/actions/adminUserApi";
import { toast } from "sonner";
import { useState } from "react";
import { LuCopy, LuEllipsis, LuTrash, LuUserCheck, LuUserX } from "react-icons/lu";
// import { UserEditDialog } from "./user-edit-dialog"; // To be implemented

interface UserActionsProps {
    user: AdminUser;
    onUserUpdated: () => void;
}

export function UserActions({ user, onUserUpdated }: UserActionsProps) {
    const [loading, setLoading] = useState(false);

    const handleCopyId = () => {
        navigator.clipboard.writeText(user.id);
        toast.success("User ID copied to clipboard");
    };

    const handleSuspend = async () => {
        try {
            setLoading(true);
            await suspendUser(user.id);
            toast.success("User suspended successfully");
            onUserUpdated();
        } catch (error) {
            toast.error("Failed to suspend user");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleReactivate = async () => {
        try {
            setLoading(true);
            await reactivateUser(user.id);
            toast.success("User reactivated successfully");
            onUserUpdated();
        } catch (error) {
            toast.error("Failed to reactivate user");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        // Add confirmation logic here if needed
        if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

        try {
            setLoading(true);
            await deleteUser(user.id);
            toast.success("User deleted successfully");
            onUserUpdated();
        } catch (error) {
            toast.error("Failed to delete user");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <LuEllipsis className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={handleCopyId}>
                        <LuCopy className="mr-2 h-4 w-4" />
                        Copy ID
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {/* <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Pen className="mr-2 h-4 w-4" />
            Edit Details
          </DropdownMenuItem> */}
                    {user.status === 'SUSPENDED' ? (
                        <DropdownMenuItem onClick={handleReactivate} disabled={loading}>
                            <LuUserCheck className="mr-2 h-4 w-4" />
                            Reactivate
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem onClick={handleSuspend} disabled={loading} className="text-orange-600">
                            <LuUserX className="mr-2 h-4 w-4" />
                            Suspend
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive" disabled={loading}>
                        <LuTrash className="mr-2 h-4 w-4" />
                        Delete User
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* {showEditDialog && (
        <UserEditDialog 
          user={user} 
          open={showEditDialog} 
          onOpenChange={setShowEditDialog}
          onUserUpdated={onUserUpdated}
        />
      )} */}
        </>
    );
}
