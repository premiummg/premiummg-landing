import type { VercelRequest, VercelResponse } from '@vercel/node';
import { esc, parseContact } from './_validate.js';
import { IP_LIMIT, clientIp, firstTimeSeen, originAllowed, verifyTurnstile, withinRateLimit } from './_guard.js';
import { sendToPremium } from './_mail.js';

const SERVICE_NAMES: Record<string, string> = {
  caulking: 'Caulking', firestopping: 'Firestopping', fireproofing: 'Fireproofing', drywall: 'Drywall', contracting: 'Contracting',
};

// POST /api/contact - an estimate request from the site's form, emailed to
// Premium with the visitor's address as Reply-To, so answering it is one click.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  if (!originAllowed(req)) return res.status(403).json({ error: 'forbidden' });

  const ip = clientIp(req);
  if (!withinRateLimit(`contact:${ip}`, IP_LIMIT)) return res.status(429).json({ error: 'rate' });

  const data = parseContact(req.body);
  if (!data) return res.status(400).json({ error: 'invalid' });
  if (!(await verifyTurnstile(data.turnstileToken, ip))) return res.status(400).json({ error: 'captcha' });
  if (!firstTimeSeen(data.submissionId)) return res.status(200).json({ ok: true });

  const service = data.service ? SERVICE_NAMES[data.service] : 'Not specified';
  const rows: [string, string][] = [
    ['Name', data.name],
    ['Company', data.company || '-'],
    ['Email', data.email],
    ['Phone', data.phone || '-'],
    ['Service', service],
    ['Language', data.lang === 'fr' ? 'French' : 'English'],
  ];
  const cell = 'padding:6px 10px;border:1px solid #ddd;';
  const html = `
    <h2 style="font-family:Arial,sans-serif;">New estimate request</h2>
    <table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">
      ${rows.map(([k, v]) => `<tr><th style="${cell}text-align:left;">${k}</th><td style="${cell}">${esc(v)}</td></tr>`).join('')}
    </table>
    <h3 style="font-family:Arial,sans-serif;">Project details</h3>
    <p style="font-family:Arial,sans-serif;font-size:14px;white-space:pre-wrap;">${esc(data.message || '-')}</p>`;
  const text = [...rows.map(([k, v]) => `${k}: ${v}`), '', 'Project details:', data.message || '-'].join('\n');

  const ok = await sendToPremium({
    subject: `Estimate request: ${data.name}${data.company ? ` (${data.company})` : ''} - ${service}`,
    html,
    text,
    replyTo: data.email,
  });
  if (!ok) return res.status(502).json({ error: 'server' });
  return res.status(200).json({ ok: true });
}
