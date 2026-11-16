import type { VercelRequest } from '@vercel/node';

// Abuse protection for the form endpoints. Each POST sends an email, which
// makes them attractive for spam. Layers, cheapest first:
//   1. Origin check  - only stops OTHER WEBSITES' browsers from posting here.
//                      A script can send any header, so it is not a control
//                      on its own.
//   2. Per-IP limit  - counts every request, so it also throttles bots that
//                      never pass the captcha.
//   3. Turnstile     - a captcha token verified with Cloudflare, active only
//                      when BOTH Turnstile keys are configured.
// The limiter is in memory, so it only sees requests on the same warm
// function instance. Real throttling across instances must ALSO be set in the
// Vercel dashboard (Firewall -> Rate limiting on POST /api/*).

export const IP_LIMIT = { max: 6, windowMs: 10 * 60_000 };
const MAX_TRACKED_KEYS = 5000;

const onVercel = () => Boolean(process.env.VERCEL);

// Prefer the headers Vercel's edge sets itself over the client-appendable
// X-Forwarded-For chain.
export function clientIp(req: VercelRequest): string {
  const pick = (name: string) => {
    const v = req.headers[name];
    return (Array.isArray(v) ? v[0] : v)?.split(',')[0]?.trim();
  };
  return pick('x-vercel-forwarded-for') || pick('x-real-ip') || pick('x-forwarded-for') || req.socket?.remoteAddress || 'unknown';
}

const stripWww = (host: string) => host.replace(/^www\./i, '').toLowerCase();

// Browsers always send Origin on a fetch() POST. Enforced on the production
// deployment only, so previews and local development keep working.
export function originAllowed(req: VercelRequest): boolean {
  if (process.env.VERCEL_ENV !== 'production') return true;
  const origin = req.headers.origin;
  const host = req.headers['x-forwarded-host'] ?? req.headers.host;
  const hostName = Array.isArray(host) ? host[0] : host;
  if (!origin || !hostName) return false;
  try {
    return stripWww(new URL(origin).host) === stripWww(hostName);
  } catch {
    return false;
  }
}

// key -> timestamps of recent hits. A Map keeps insertion order, which lets
// the hard cap below evict the oldest keys first.
const hits = new Map<string, number[]>();

export function withinRateLimit(key: string, { max, windowMs }: { max: number; windowMs: number }): boolean {
  if (!onVercel()) return true; // never throttle local development
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter(t => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.delete(key);
  hits.set(key, recent);
  if (hits.size > MAX_TRACKED_KEYS) {
    let drop = Math.ceil(MAX_TRACKED_KEYS / 10);
    for (const k of hits.keys()) {
      hits.delete(k);
      if (--drop <= 0) break;
    }
  }
  return true;
}

// The captcha is ON only when BOTH keys exist: with one of them the site
// would either reject everyone or show a widget nobody checks.
export function turnstileActive(): boolean {
  const secret = Boolean(process.env.TURNSTILE_SECRET_KEY);
  const site = Boolean(process.env.TURNSTILE_SITE_KEY);
  if (secret !== site) {
    console.error('Turnstile is half-configured (need BOTH TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY): the captcha is OFF.');
  }
  return secret && site;
}

export async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  if (!turnstileActive()) return true;
  if (!token) return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY ?? '', response: token, remoteip: ip }),
      signal: AbortSignal.timeout(4000),
    });
    const json = (await res.json()) as { success?: boolean };
    return json.success === true;
  } catch (err) {
    // Fail closed: better to ask for a retry than wave an unverified request through.
    console.error('Turnstile verification failed:', err instanceof Error ? err.name : 'unknown');
    return false;
  }
}

// The same request sent twice (a double click, a retry after a slow answer)
// is answered OK without sending a second email.
const seen = new Map<string, number>();
export function firstTimeSeen(submissionId: string): boolean {
  const now = Date.now();
  for (const [k, t] of seen) if (now - t > 60 * 60_000) seen.delete(k);
  if (seen.has(submissionId)) return false;
  seen.set(submissionId, now);
  return true;
}
