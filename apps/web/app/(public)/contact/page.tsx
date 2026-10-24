import { Suspense } from 'react';
import ContactClient from './contact-client';

export const dynamic = 'force-dynamic';

export default function ContactPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen text-zinc-600 dark:text-zinc-400 font-mono flex items-center justify-center">
                <div className="text-zinc-500 animate-pulse font-mono text-xs">LOADING_INTERFACE...</div>
            </div>
        }>
            <ContactClient />
        </Suspense>
    );
}
