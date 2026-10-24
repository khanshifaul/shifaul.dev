"use client";

import SubscribersTable from "./_components/subscribers-table";

export default function SubscribersClient() {
    return (
        <div className="w-full">
            <h1 className="text-2xl font-bold mb-4">Newsletter Subscribers</h1>
            <SubscribersTable />
        </div>
    );
}
