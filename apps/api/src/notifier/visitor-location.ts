/**
 * A visitor location resolved server-side from the request IP.
 * Every field is optional: an unresolved lookup produces `null`, not zeros.
 */
export interface VisitorLocation {
  city?: string | null;
  region?: string | null;
  /** Full country name, e.g. `United States`. */
  country?: string | null;
  /** ISO 3166-1 alpha-2 code, e.g. `US`. */
  countryCode?: string | null;
  isp?: string | null;
  /** IANA timezone id, e.g. `America/Los_Angeles`. */
  timezone?: string | null;
}

/**
 * Format `at` on the visitor's clock, e.g. `2026-11-04 22:15 (America/Los_Angeles)`.
 * Returns null when the timezone is missing or not a valid IANA id.
 */
export function formatVisitorLocalTime(
  timezone: string | null | undefined,
  at: Date = new Date(),
): string | null {
  if (!timezone) return null;
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(at);

    const values = new Map(parts.map((p) => [p.type, p.value]));
    const year = values.get('year');
    const month = values.get('month');
    const day = values.get('day');
    const hour = values.get('hour');
    const minute = values.get('minute');
    if (!year || !month || !day || !hour || !minute) return null;

    return `${year}-${month}-${day} ${hour}:${minute} (${timezone})`;
  } catch {
    // RangeError from Intl on an unknown timezone — treat as unresolved.
    return null;
  }
}
