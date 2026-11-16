import type { VercelRequest, VercelResponse } from '@vercel/node';
import { turnstileActive } from './_guard.js';

// What the browser needs to know about this deployment: the public Turnstile
// SITE key when the captcha is configured. No secret is ever returned. Served
// at runtime so switching the captcha on is an env-var change, not a rebuild;
// cached one minute only, so a deploy is picked up quickly.
export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'public, s-maxage=60');
  res.status(200).json({
    turnstileSiteKey: turnstileActive() ? process.env.TURNSTILE_SITE_KEY : undefined,
  });
}
