"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
    NewsletterSubscriber,
    deleteNewsletterSubscriber,
    getNewsletterSubscribers,
} from "@/lib/actions/newsletterApi";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DeleteDialog from "../../_components/delete-dialog";

const SubscribersTable = () => {
    const router = useRouter();
    const { user: _user } = useAuth();
    const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const fetchSubscribers = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await getNewsletterSubscribers({});
            if (result.data.success && result.data.data) {
                setSubscribers(result.data.data);
            } else {
                setError(result.data.message || "Failed to fetch subscribers");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const handleDelete = async (id: string) => {
        try {
            const result = await deleteNewsletterSubscriber(id);
            if (result.data.success) {
                setSubscribers((prev) => prev.filter((sub) => sub.id !== id));
                router.refresh();
            } else {
                setError(result.data.message || "Failed to delete subscriber");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete subscriber");
        }
    };

    const filteredSubscribers = subscribers.filter((sub) =>
        sub.email.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between">
                <Input
                    placeholder="Search subscribers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <Table className="w-full">
                <TableHeader>
                    <TableRow>
                        <TableHead>Sl.</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Subscribed At</TableHead>
                        <TableHead className="text-center">Delete</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredSubscribers.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center">
                                No subscribers found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredSubscribers.map((subscriber, index) => (
                            <TableRow key={subscriber.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{subscriber.email}</TableCell>
                                <TableCell>
                                    {new Date(subscriber.subscribedAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-center">
                                    <DeleteDialog
                                        Id={subscriber.id}
                                        item="subscriber"
                                        onDelete={handleDelete}
                                        prefetchAction={fetchSubscribers}
                                    />
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default SubscribersTable;
