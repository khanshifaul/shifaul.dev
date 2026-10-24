const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Helper to get or create ID
function getOrCreateId(key: string, storage: Storage): string {
    if (typeof window === 'undefined') return '';
    let id = storage.getItem(key);
    if (!id) {
        id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        storage.setItem(key, id);
    }
    return id;
}

export async function trackEvent(event: string, metadata?: any) {
  if (typeof window === 'undefined') return;

  const visitorId = getOrCreateId('visitor_id', localStorage);
  const sessionId = getOrCreateId('session_id', sessionStorage);

  let geoData = {};
  try {
      // Fetch with a timeout to avoid blocking if the API is slow
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 seconds timeout
      
      const geoResponse = await fetch('https://ipwho.is/', { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (geoResponse.ok) {
          const data = await geoResponse.json();
          geoData = {
              ip: data.ip,
              city: data.city,
              region: data.region,
              country: data.country, // ipwho.is uses 'country' instead of 'country_name'
              loc: `${data.latitude},${data.longitude}`,
          };
      }
  } catch (error) {
      console.warn('Failed to fetch geo data:', error);
  }

  const defaultMetadata = {
      visitorId,
      sessionId,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      colorDepth: window.screen.colorDepth,
      touchSupport: 'ontouchstart' in window,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: (navigator as any).deviceMemory,
      networkType: (navigator as any).connection?.effectiveType,
      doNotTrack: navigator.doNotTrack,
      webdriver: navigator.webdriver,
      pageTitle: document.title,
      ...geoData,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/analytics/collect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event,
        url: window.location.href,
        referrer: document.referrer,
        metadata: {
            ...defaultMetadata,
            ...metadata,
        },
      }),
    });

    if (!response.ok) {
      console.warn('Failed to send analytics event:', response.statusText);
    }
  } catch (error) {
    console.warn('Failed to send analytics event:', error);
  }
}

/**
 * Visitor notification — fires once per page view. The backend dedupes by
 * IP + user-agent and sends a Telegram message to Shifaul for new visitors.
 */
export async function trackVisit(metadata?: {
  isReturning?: boolean;
}) {
  if (typeof window === 'undefined') return;

  try {
    await fetch(`${API_BASE_URL}/analytics/visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: window.location.pathname,
        referrer: document.referrer || undefined,
        isReturning: metadata?.isReturning,
      }),
    });
  } catch {
    // Silent — visitor notification is best-effort
  }
}
