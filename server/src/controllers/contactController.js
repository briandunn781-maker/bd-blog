import { z } from 'zod';
import HttpError from '../utils/httpError.js';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
// Cloudflare's documented test secret: accepts any token. Used only in development.
const DEV_TEST_SECRET = '1x0000000000000000000000000000000AA';

const revealSchema = z.object({
  token: z.string().min(1, 'Verification token is required').max(2048),
});

function turnstileSecret() {
  if (process.env.TURNSTILE_SECRET_KEY) return process.env.TURNSTILE_SECRET_KEY;
  if (process.env.NODE_ENV !== 'production') return DEV_TEST_SECRET;
  throw new HttpError(500, 'Bot protection is not configured: set TURNSTILE_SECRET_KEY');
}

async function verifyTurnstile(token, ip) {
  const body = new URLSearchParams({ secret: turnstileSecret(), response: token });
  if (ip) body.set('remoteip', ip);
  try {
    const res = await fetch(VERIFY_URL, { method: 'POST', body });
    const result = await res.json();
    return result.success === true;
  } catch {
    throw new HttpError(502, 'Could not reach the verification service, please try again');
  }
}

// POST /api/contact/reveal-email -> { email }, only after a passed Turnstile check
export async function revealEmail(req, res) {
  const { token } = revealSchema.parse(req.body);
  if (!(await verifyTurnstile(token, req.ip))) {
    throw new HttpError(403, 'Verification failed, please try again');
  }
  const email = process.env.CONTACT_EMAIL?.trim();
  if (!email) throw new HttpError(500, 'Contact email is not configured');
  res.set('Cache-Control', 'no-store').json({ email });
}
