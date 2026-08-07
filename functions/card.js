// GET /card
// Serves the PIN entry form, or the directory itself if a valid
// session cookie is present. The directory content lives only in
// this function — it is never a standalone static file, so there
// is nothing to find by guessing a URL.

function pageShell(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="robots" content="noindex, nofollow">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='11' fill='none' stroke='%236B2737' stroke-width='2'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/style.css">
<style>
  .card-gate {
    min-height: 100vh; min-height: 100svh;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center; padding: 40px 20px;
  }
  .card-gate h1 {
    font-family: var(--display); font-style: italic; font-weight: 900;
    font-size: clamp(1.8rem, 5vw, 2.8rem); max-width: 14ch; line-height: 1.2;
    margin-bottom: 1.8rem;
  }
  .card-gate form { display: flex; flex-direction: column; gap: 1.1rem; width: min(88vw, 300px); }
  .card-gate input[type=text] {
    font-family: var(--sans); font-size: 16px; letter-spacing: 0.3em; text-align: center;
    padding: 0.9em; border: 1px solid rgba(26,26,24,0.3); background: transparent; color: var(--ink);
  }
  .card-gate .error {
    color: var(--burgundy); font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase;
    margin-top: -0.7rem;
  }
  .card-directory { max-width: 560px; margin: 0 auto; padding: 110px 24px 100px; }
  .card-directory h1 {
    font-family: var(--display); font-style: italic; font-weight: 900;
    font-size: clamp(2rem, 5vw, 3.1rem); margin-bottom: 2.6rem;
  }
  .card-links { display: flex; flex-direction: column; margin-bottom: 3.4rem; }
  .card-links a {
    display: block; padding: 1em 0; border-bottom: 1px solid var(--rule);
    font-family: var(--sans); font-size: 14px; letter-spacing: 0.03em; color: var(--ink);
  }
  .card-links a:hover { color: var(--burgundy); }
  .card-links .label {
    display: block; font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase;
    color: var(--grey); margin-bottom: 0.35em;
  }
  .card-enquiry h2 { font-family: var(--display); font-weight: 900; font-size: 1.3rem; margin-bottom: 1.1rem; }
  .card-enquiry form { display: flex; flex-direction: column; gap: 1rem; }
  .card-enquiry input, .card-enquiry textarea {
    font-family: var(--sans); font-size: 14px; padding: 0.8em;
    border: 1px solid rgba(26,26,24,0.25); background: transparent; color: var(--ink); width: 100%;
  }
  .card-enquiry textarea { min-height: 100px; resize: vertical; }
  .card-sent { color: var(--burgundy); font-size: 13px; margin-bottom: 1rem; }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

function pinFormHtml(showError) {
  return pageShell('Lea the Witch', `
  <div class="card-gate">
    <span class="eyebrow" style="display:block;margin-bottom:1.2rem;">Lea the Witch</span>
    <h1>You&rsquo;ll need the code from the card.</h1>
    ${showError ? '<p class="error">That code didn&rsquo;t work &mdash; check it and try again.</p>' : ''}
    <form method="POST" action="/api/verify">
      <input type="text" name="pin" placeholder="Code" autocomplete="off" autocapitalize="off" spellcheck="false" required>
      <button type="submit" class="btn-ghost">Enter</button>
    </form>
  </div>`);
}

function directoryHtml(showSent) {
  return pageShell('Lea the Witch', `
  <div class="card-directory">
    <span class="eyebrow" style="display:block;margin-bottom:1rem;">Lea the Witch</span>
    <h1>Good, you made it.</h1>

    <div class="card-links">
      <a href="https://leathewitch.com" target="_blank" rel="noopener noreferrer"><span class="label">Website</span>leathewitch.com</a>
      <a href="https://www.instagram.com/leathewitch/" target="_blank" rel="noopener noreferrer"><span class="label">Instagram</span>@leathewitch</a>
      <a href="https://www.pinterest.com/leathewitch/" target="_blank" rel="noopener noreferrer"><span class="label">Pinterest</span>@leathewitch</a>
      <a href="https://github.com/Leamonlime" target="_blank" rel="noopener noreferrer"><span class="label">GitHub</span>Leamonlime</a>
      <a href="mailto:hello@leathewitch.com"><span class="label">Email</span>hello@leathewitch.com</a>
      <a href="mailto:lea.ehlers@pm.me"><span class="label">Personal email</span>lea.ehlers@pm.me</a>
    </div>

    <div class="card-enquiry">
      <h2>Want a resume or cover letter?</h2>
      ${showSent ? '<p class="card-sent">Sent &mdash; I&rsquo;ll get back to you.</p>' : ''}
      <form method="POST" action="/api/enquiry">
        <input type="text" name="name" placeholder="Your name" required>
        <input type="email" name="email" placeholder="Your email" required>
        <textarea name="message" placeholder="Anything specific you'd like included (optional)"></textarea>
        <button type="submit" class="btn-ghost">Request</button>
      </form>
    </div>
  </div>`);
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookieMatch = cookieHeader.match(/(?:^|;\s*)card_session=([^;]+)/);

  let authed = false;
  if (cookieMatch && env.CARD_CODES) {
    const sessionValue = await env.CARD_CODES.get('session:' + cookieMatch[1]);
    authed = !!sessionValue;
  }

  const html = authed
    ? directoryHtml(url.searchParams.get('enquiry') === 'sent')
    : pinFormHtml(url.searchParams.get('error') === '1');

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=UTF-8' }
  });
}
