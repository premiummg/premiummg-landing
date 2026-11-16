import { Resend } from 'resend';
import { COMPANY_EMAIL } from '../src/site.js';

// Who receives requests. CONTACT_TO lets a preview deployment point somewhere
// else without a code change.
export const recipient = () => process.env.CONTACT_TO || COMPANY_EMAIL;
const sender = () => process.env.MAIL_FROM || 'Premium Group <no-reply@premiummg.ca>';

let client: Resend | null = null;
const resend = () => (client ??= new Resend(process.env.RESEND_API_KEY));

export interface Mail {
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

/**
 * Sends one email to Premium. Without RESEND_API_KEY, local development
 * prints it to the terminal instead (so the form can be tried without an
 * account), while a Vercel deployment treats it as a failure: a site that
 * silently drops estimate requests is worse than one that says it can't send.
 */
export async function sendToPremium(mail: Mail): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    if (process.env.VERCEL) {
      console.error('RESEND_API_KEY is not set: the request was NOT delivered.');
      return false;
    }
    console.log(`\n[mail to ${recipient()}] ${mail.subject}\n${mail.text}\n`);
    return true;
  }
  const { error } = await resend().emails.send({
    from: sender(),
    to: recipient(),
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    replyTo: mail.replyTo,
  });
  if (error) {
    // The error's name and message only: never the request body.
    console.error('Resend refused the email:', error.name, error.message);
    return false;
  }
  return true;
}

/** Adds an address to the newsletter audience, when one is configured. */
export async function addToAudience(email: string): Promise<'added' | 'no-audience' | 'failed'> {
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId || !process.env.RESEND_API_KEY) return 'no-audience';
  const { error } = await resend().contacts.create({ email, audienceId, unsubscribed: false });
  if (error) {
    console.error('Resend refused the contact:', error.name, error.message);
    return 'failed';
  }
  return 'added';
}
