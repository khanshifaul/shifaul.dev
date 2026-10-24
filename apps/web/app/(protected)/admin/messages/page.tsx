import { Suspense } from 'react';
import MessagesClient from './messages-client';

export const dynamic = 'force-dynamic';

export default function MessagesPage() {
    return (
        <Suspense fallback={<div>Loading messages...</div>}>
            <MessagesClient />
        </Suspense>
    );
}
