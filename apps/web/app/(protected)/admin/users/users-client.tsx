"use client";

import { useEffect, useState } from "react";
import { getUsers, PaginatedUsers } from "@/lib/actions/adminUserApi";
import { UsersTable } from "./_components/users-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { Separator } from "@/components/ui/separator";
import { LuSearch } from "react-icons/lu";

export default function UsersClient() {
    const [data, setData] = useState<PaginatedUsers | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);
    const [page, setPage] = useState(1);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
            const response = await getUsers({
                page,
                limit: 10,
                search: debouncedSearch,
            }, accessToken || undefined);

            if (response.data) {
                let usersData = response.data.data;
                let paginationData = response.data.pagination;

                if (!Array.isArray(usersData) && usersData && typeof usersData === 'object' && 'users' in usersData) {
                    // @ts-ignore
                    const meta = usersData;
                    paginationData = {
                        // @ts-ignore
                        page: meta.page || 1,
                        // @ts-ignore
                        limit: meta.limit || 10,
                        // @ts-ignore
                        total: meta.total || 0,
                        // @ts-ignore
                        totalPages: meta.totalPages || 1
                    };
                    // @ts-ignore
                    usersData = usersData.users;
                }

                if (Array.isArray(usersData)) {
                    setData({
                        data: usersData,
                        pagination: paginationData || {
                            page: 1,
                            limit: 10,
                            total: usersData.length,
                            totalPages: 1
                        }
                    });
                } else {
                    console.error("Unexpected users data structure:", usersData);
                    setData({
                        data: [],
                        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
                    });
                }
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [debouncedSearch, page]);

    return (
        <div className="flex-1 space-y-4 p-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
            </div>
            <Separator />

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <LuSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search users..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <UsersTable
                users={data?.data || []}
                loading={loading}
                onUserUpdated={fetchUsers}
            />

            {data?.pagination && data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || loading}
                    >
                        Previous
                    </Button>
                    <div className="text-sm text-muted-foreground">
                        Page {data.pagination.page} of {data.pagination.totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                        disabled={page === data.pagination.totalPages || loading}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}
