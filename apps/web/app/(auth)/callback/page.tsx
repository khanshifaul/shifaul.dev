import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

// This old route is deprecated. The backend redirects to /auth/callback instead.
export default function DeprecatedCallback() {
    redirect('/auth/callback');
}
