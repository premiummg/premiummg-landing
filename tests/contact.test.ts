import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { esc, parseContact } from '../api/_validate';

// Resend is replaced for every test: nothing here can send a real email.
const send = vi.hoisted(() => vi.fn());
const createContact = vi.hoisted(() => vi.fn());
vi.mock('resend', () => ({
  Resend: class {
    emails = { send };
    contacts = { create: createContact };
  },
}));

type Json = Record<string, unknown>;

function validBody(overrides: Json = {}): Json {
  return {
    name: 'Ana Roy',
    company: 'Northgate Construction',
    email: 'ana@example.com',
    phone: '506 555 0134',
    service: 'firestopping',
    message: 'Six storeys, rated corridors.\nStart in March.',
    lang: 'en',
    submissionId: '3f2b9c1e-8a44-4c58-9d0e-1b7a6c5d4e3f',
    ...overrides,
  };
}

function fakeRes() {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    headers: {} as Record<string, string>,
    status(code: number) { res.statusCode = code; return res; },
    json(b: unknown) { res.body = b; return res; },
    setHeader(k: string, v: string) { res.headers[k] = v; return res; },
  };
  return res;
}

// A fresh copy of the handler (and of every module-level limiter and cache)
// per call, so no test depends on another having run first.
async function call(endpoint: 'contact' | 'subscribe', method: string, body: unknown, headers: Record<string, string> = {}) {
  vi.resetModules();
  const handler = (endpoint === 'contact' ? await import('../api/contact') : await import('../api/subscribe')).default;
  const res = fakeRes();
  await handler({ method, body, headers, socket: {} } as never, res as never);
  return res;
}

beforeEach(() => {
  send.mockReset().mockResolvedValue({ data: { id: 'x' }, error: null });
  createContact.mockReset().mockResolvedValue({ data: { id: 'c' }, error: null });
  vi.stubEnv('RESEND_API_KEY', 're_test');
  vi.stubEnv('VERCEL', '');
  vi.stubEnv('VERCEL_ENV', '');
  vi.stubEnv('TURNSTILE_SITE_KEY', '');
  vi.stubEnv('TURNSTILE_SECRET_KEY', '');
  vi.stubEnv('RESEND_AUDIENCE_ID', '');
  vi.stubEnv('CONTACT_TO', '');
});
afterEach(() => vi.unstubAllEnvs());

describe('parseContact', () => {
  it('accepts the request the real form sends', () => {
    expect(parseContact(validBody())).toMatchObject({ name: 'Ana Roy', service: 'firestopping', lang: 'en' });
  });

  it('rejects a missing name, a bad email and an unknown service', () => {
    expect(parseContact(validBody({ name: '  ' }))).toBeNull();
    expect(parseContact(validBody({ email: 'ana@' }))).toBeNull();
    expect(parseContact(validBody({ service: 'plumbing' }))).toBeNull();
  });

  it('rejects a line break in a one-line field (header injection)', () => {
    expect(parseContact(validBody({ name: 'Ana\r\nBcc: x@evil.test' }))).toBeNull();
  });

  it('keeps line breaks in the message but rejects other control characters', () => {
    expect(parseContact(validBody())?.message).toContain('\n');
    expect(parseContact(validBody({ message: 'a\u0007b' }))).toBeNull();
  });

  it('rejects text longer than the form allows', () => {
    expect(parseContact(validBody({ message: 'x'.repeat(2001) }))).toBeNull();
  });
});

describe('esc', () => {
  it('neutralises markup', () => {
    expect(esc('<a href="x">Ana</a> & co')).toBe('&lt;a href=&quot;x&quot;&gt;Ana&lt;/a&gt; &amp; co');
  });
});

describe('POST /api/contact', () => {
  it('answers 405 to anything but POST', async () => {
    const res = await call('contact', 'GET', undefined);
    expect(res.statusCode).toBe(405);
    expect(res.headers.Allow).toBe('POST');
  });

  it('answers 400 to an invalid body and sends nothing', async () => {
    const res = await call('contact', 'POST', validBody({ email: 'nope' }));
    expect(res.statusCode).toBe(400);
    expect(send).not.toHaveBeenCalled();
  });

  it('emails Premium with the visitor as Reply-To and escapes what they typed', async () => {
    const res = await call('contact', 'POST', validBody({ company: '<b>Evil</b>' }));
    expect(res.statusCode).toBe(200);
    expect(send).toHaveBeenCalledTimes(1);
    const mail = send.mock.calls[0][0];
    expect(mail.to).toBe('info@premiummg.ca');
    expect(mail.replyTo).toBe('ana@example.com');
    expect(mail.html).toContain('&lt;b&gt;Evil&lt;/b&gt;');
    expect(mail.html).not.toContain('<b>Evil</b>');
    expect(mail.subject).toContain('Firestopping');
  });

  it('CONTACT_TO redirects the email', async () => {
    vi.stubEnv('CONTACT_TO', 'staging@example.com');
    await call('contact', 'POST', validBody());
    expect(send.mock.calls[0][0].to).toBe('staging@example.com');
  });

  it('answers 502 when Resend refuses', async () => {
    send.mockResolvedValue({ data: null, error: { name: 'validation_error', message: 'bad from' } });
    const res = await call('contact', 'POST', validBody());
    expect(res.statusCode).toBe(502);
  });

  it('on Vercel with no Resend key, fails instead of dropping the request silently', async () => {
    vi.stubEnv('RESEND_API_KEY', '');
    vi.stubEnv('VERCEL', '1');
    const res = await call('contact', 'POST', validBody());
    expect(res.statusCode).toBe(502);
  });

  it('requires the captcha when Turnstile is configured', async () => {
    vi.stubEnv('TURNSTILE_SITE_KEY', 'site');
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'secret');
    const res = await call('contact', 'POST', validBody());
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'captcha' });
    expect(send).not.toHaveBeenCalled();
  });

  it('on production, refuses a POST from another website', async () => {
    vi.stubEnv('VERCEL_ENV', 'production');
    const res = await call('contact', 'POST', validBody(), { origin: 'https://evil.test', host: 'premiummg.ca' });
    expect(res.statusCode).toBe(403);
  });
});

describe('POST /api/subscribe', () => {
  it('without an audience, emails the sign-up to Premium', async () => {
    const res = await call('subscribe', 'POST', { email: 'ana@example.com', lang: 'fr', submissionId: 'abcdef12-3456' });
    expect(res.statusCode).toBe(200);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0].text).toContain('French');
    expect(createContact).not.toHaveBeenCalled();
  });

  it('with an audience, adds the contact instead of emailing', async () => {
    vi.stubEnv('RESEND_AUDIENCE_ID', 'aud_1');
    const res = await call('subscribe', 'POST', { email: 'ana@example.com', lang: 'en', submissionId: 'abcdef12-3456' });
    expect(res.statusCode).toBe(200);
    expect(createContact).toHaveBeenCalledWith(expect.objectContaining({ email: 'ana@example.com', audienceId: 'aud_1' }));
    expect(send).not.toHaveBeenCalled();
  });

  it('rejects an invalid address', async () => {
    const res = await call('subscribe', 'POST', { email: 'x', submissionId: 'abcdef12-3456' });
    expect(res.statusCode).toBe(400);
  });
});
