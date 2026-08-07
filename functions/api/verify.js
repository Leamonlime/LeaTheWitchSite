// POST /api/verify
// Checks the submitted code against the CARD_CODES KV namespace.
// Codes are added manually in the Cloudflare dashboard: Key = the
// code itself, Value = a label for that batch of cards (e.g.
// "print-run-1"), Expiration = whenever that batch should stop
// working. Cloudflare deletes expired keys on its own — this
// function never has to think about expiry, an unknown or expired
// code just isn't in KV anymore.

export async function onRequestPost(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  if (!env.CARD_CODES) {
    return Response.redirect(new URL('/card?error=1', url), 303);
  }

  const form = await request.formData();
  const pin = (form.get('pin') || '').toString().trim();

  if (!pin) {
    return Response.redirect(new URL('/card?error=1', url), 303);
  }

  const batch = await env.CARD_CODES.get(pin);

  if (!batch) {
    return Response.redirect(new URL('/card?error=1', url), 303);
  }

  const token = crypto.randomUUID();
  const THIRTY_DAYS = 60 * 60 * 24 * 30;
  await env.CARD_CODES.put('session:' + token, batch, { expirationTtl: THIRTY_DAYS });

  const headers = new Headers();
  headers.set('Location', '/card');
  headers.append(
    'Set-Cookie',
    `card_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${THIRTY_DAYS}`
  );

  return new Response(null, { status: 303, headers });
}
