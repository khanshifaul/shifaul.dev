"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContactMessage, getContactMessages } from "@/lib/actions/contactApi";
import Link from "next/link";
import { useEffect, useState } from "react";

export function RecentActivity() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMessages() {
            try {
                const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
                const response = await getContactMessages({ limit: 5 }, accessToken || undefined);
                if (response.data.success) {
                    const data = response.data.data as any;
                    // Handle nested structure from list endpoint
                    if (data && typeof data === 'object') {
                        if (Array.isArray(data)) {
                            setMessages(data);
                        } else if (Array.isArray(data.messages)) {
                            setMessages(data.messages);
                        } else {
                            setMessages([]);
                        }
                    } else {
                        setMessages([]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch recent messages", error);
            } finally {
                setLoading(false);
            }
        }

        fetchMessages();
    }, []);

    return (
        <Card className="col-span-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1">
                    <CardTitle>Recent Messages</CardTitle>
                    <CardDescription>
                        Latest contact form submissions.
                    </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/messages">View All</Link>
                </Button>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[300px]">
                    <div className="space-y-8">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="flex items-center space-x-4">
                                    <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
                                    <div className="space-y-2">
                                        <div className="h-4 w-[200px] animate-pulse rounded bg-muted" />
                                        <div className="h-4 w-[150px] animate-pulse rounded bg-muted" />
                                    </div>
                                </div>
                            ))
                        ) : messages.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No recent messages.</p>
                        ) : (
                            messages.map((message) => (
                                <div key={message.id} className="flex items-center">
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback>
                                            {message.name.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{message.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {message.email}
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium">
                                        {new Date(message.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
