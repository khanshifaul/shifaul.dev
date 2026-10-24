import { Suspense } from 'react';
import UsersClient from './users-client';

export const dynamic = 'force-dynamic';

export default function UsersPage() {
    return (
        <Suspense fallback={<div>Loading users...</div>}>
            <UsersClient />
        </Suspense>
    );
}
