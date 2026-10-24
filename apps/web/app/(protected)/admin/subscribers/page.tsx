import { Suspense } from 'react';
import SubscribersClient from './subscribers-client';

export const dynamic = 'force-dynamic';

export default function SubscribersPage() {
    return (
        <Suspense fallback={<div>Loading subscribers...</div>}>
            <SubscribersClient />
        </Suspense>
    );
}
