import type { VercelRequest, VercelResponse } from '@vercel/node';
import { esc, parseSubscribe } from './_validate.js';
import { clientIp, firstTimeSeen, originAllowed, withinRateLimit } from './_guard.js';
import { addToAudience, sendToPremium } from './_mail.js';

// The footer's newsletter sign-up is on every page, so it carries no captcha
// (that would load Cloudflare's script on every visit); a tighter per-IP
// limit stands in for it instead.
const SUBSCRIBE_LIMIT = { max: 3, windowMs: 60 * 60_000 };

// POST /api/subscribe - adds the address to a Resend audience when
// RESEND_AUDIENCE_ID is set, and otherwise emails it to Premium.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  if (!originAllowed(req)) return res.status(403).json({ error: 'forbidden' });
  if (!withinRateLimit(`subscribe:${clientIp(req)}`, SUBSCRIBE_LIMIT)) return res.status(429).json({ error: 'rate' });

  const data = parseSubscribe(req.body);
  if (!data) return res.status(400).json({ error: 'invalid' });
  if (!firstTimeSeen(data.submissionId)) return res.status(200).json({ ok: true });

  const added = await addToAudience(data.email);
  if (added === 'added') return res.status(200).json({ ok: true });
  if (added === 'failed') return res.status(502).json({ error: 'server' });

  const ok = await sendToPremium({
    subject: `Newsletter sign-up: ${data.email}`,
    html: `<p style="font-family:Arial,sans-serif;">New newsletter sign-up: <strong>${esc(data.email)}</strong> (${data.lang === 'fr' ? 'French' : 'English'}).</p>`,
    text: `New newsletter sign-up: ${data.email} (${data.lang === 'fr' ? 'French' : 'English'}).`,
    replyTo: data.email,
  });
  if (!ok) return res.status(502).json({ error: 'server' });
  return res.status(200).json({ ok: true });
}
