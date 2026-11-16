import { EMAIL_PATTERN, LIMITS, SERVICE_KEYS, type ServiceKey } from '../src/formLimits.js';

export interface ContactRequest {
  name: string;
  company: string;
  email: string;
  phone: string;
  service: ServiceKey | '';
  message: string;
  lang: 'en' | 'fr';
  submissionId: string;
  turnstileToken?: string;
}

export interface SubscribeRequest {
  email: string;
  lang: 'en' | 'fr';
  submissionId: string;
}

// Every value that ends up in an email goes through this: the message is read
// in Premium's mail client, where a name like `<a href=...>` would otherwise
// become a live link inside a message they trust.
export const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const SUBMISSION_ID = /^[A-Za-z0-9-]{8,64}$/;

function str(v: unknown, max: number, required: boolean): string | null {
  if (v === undefined || v === null) return required ? null : '';
  if (typeof v !== 'string') return null;
  const s = v.trim();
  if (required && !s) return null;
  if (s.length > max) return null;
  return s;
}

// Control characters never belong in a one-line field, and CR/LF in a value
// that reaches an email header is how header injection works. The message may
// keep its line breaks.
const oneLine = (s: string) => !/[\u0000-\u001f\u007f]/.test(s);

export function parseContact(body: unknown): ContactRequest | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;
  const name = str(b.name, LIMITS.name, true);
  const company = str(b.company, LIMITS.company, false);
  const email = str(b.email, LIMITS.email, true);
  const phone = str(b.phone, LIMITS.phone, false);
  const service = str(b.service, 40, false);
  const message = str(b.message, LIMITS.message, false);
  const submissionId = str(b.submissionId, 64, true);
  if (name === null || company === null || email === null || phone === null || service === null || message === null || submissionId === null) return null;
  if (![name, company, email, phone].every(oneLine)) return null;
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(message)) return null;
  if (!EMAIL_PATTERN.test(email)) return null;
  if (service && !(SERVICE_KEYS as readonly string[]).includes(service)) return null;
  if (!SUBMISSION_ID.test(submissionId)) return null;
  const token = typeof b.turnstileToken === 'string' && b.turnstileToken.length <= 4096 ? b.turnstileToken : undefined;
  return {
    name, company, email, phone, message, submissionId,
    service: service as ServiceKey | '',
    lang: b.lang === 'fr' ? 'fr' : 'en',
    turnstileToken: token,
  };
}

export function parseSubscribe(body: unknown): SubscribeRequest | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;
  const email = str(b.email, LIMITS.email, true);
  const submissionId = str(b.submissionId, 64, true);
  if (email === null || submissionId === null) return null;
  if (!EMAIL_PATTERN.test(email) || !SUBMISSION_ID.test(submissionId)) return null;
  return { email, submissionId, lang: b.lang === 'fr' ? 'fr' : 'en' };
}
