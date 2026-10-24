"use client";

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackEvent, trackVisit } from '@/lib/utils/analytics';

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    trackEvent('page_view', {
      path: pathname,
      search: searchParams.toString(),
    });
    // Visitor notification (deduped server-side by IP+UA)
    trackVisit();
  }, [pathname, searchParams]);

  return null;
}
