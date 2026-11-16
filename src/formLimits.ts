// Maximum lengths for the forms' free-text fields. ONE list, used by the
// inputs (`maxLength`, so the browser stops typing) and by the server's
// validation (api/_validate.ts, which rejects anything longer), so a visitor
// never meets a server error for text the form happily accepted.
export const LIMITS = {
  name: 80,
  company: 120,
  email: 254,
  phone: 30,
  message: 2000,
} as const;

// Deliberately simple (not the full RFC 5322 grammar): catches a missing "@"
// or domain without rejecting real addresses, and never lets through commas,
// angle brackets or quotes, which would make a malformed Reply-To header.
// Shared by the form and the server.
export const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

// The services a request can be about - the keys of src/content/services.ts.
// Kept here (not imported from there) so api/ doesn't pull in the site's copy.
export const SERVICE_KEYS = ['caulking', 'firestopping', 'fireproofing', 'drywall', 'contracting'] as const;
export type ServiceKey = (typeof SERVICE_KEYS)[number];
