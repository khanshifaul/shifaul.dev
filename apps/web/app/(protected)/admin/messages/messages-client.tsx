"use client";

import MessageTable from "./_components/message-table";

export default function MessagesClient() {
    return (
        <div className="w-full">
            <h1 className="text-2xl font-bold mb-4">Messages</h1>
            <MessageTable />
        </div>
    );
}
