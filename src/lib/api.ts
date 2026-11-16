// Thin client for the serverless functions in api/. Errors come back as a
// short machine code the form turns into copy in the visitor's language.
export type ApiError = 'invalid' | 'captcha' | 'rate' | 'server';

export async function postJson(path: string, body: unknown): Promise<{ ok: true } | { ok: false; error: ApiError }> {
  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) return { ok: true };
    if (res.status === 429) return { ok: false, error: 'rate' };
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    if (json.error === 'captcha') return { ok: false, error: 'captcha' };
    if (res.status === 400) return { ok: false, error: 'invalid' };
    return { ok: false, error: 'server' };
  } catch {
    return { ok: false, error: 'server' };
  }
}

export interface SiteConfig {
  turnstileSiteKey?: string;
}

let configPromise: Promise<SiteConfig> | null = null;

// Fetched once per visit: whether the captcha is switched on is a deployment
// setting (env vars), not something baked into the build.
export function siteConfig(): Promise<SiteConfig> {
  configPromise ??= fetch('/api/site-config')
    .then(r => (r.ok ? (r.json() as Promise<SiteConfig>) : {}))
    .catch(() => ({}));
  return configPromise;
}

/** A per-submission id, so a double click or a retry is never sent twice. */
export function newSubmissionId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
