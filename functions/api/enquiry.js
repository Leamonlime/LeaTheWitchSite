// POST /api/enquiry
// Handles the resume/cover-letter request form on /card and emails
// it to Lea via Resend. Requires a RESEND_API_KEY environment
// variable set in the Pages project (Settings -> Environment
// variables), and a verified sending domain in Resend.

const NOTIFY_TO = 'lea.ehlers@pm.me';
const FROM_ADDRESS = 'Lea the Witch <card@notify.leathewitch.com>';

export async function onRequestPost(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const form = await request.formData();
  const name = (form.get('name') || '').toString().trim().slice(0, 200);
  const email = (form.get('email') || '').toString().trim().slice(0, 200);
  const message = (form.get('message') || '').toString().trim().slice(0, 2000);

  if (!name || !email) {
    return Response.redirect(new URL('/card?enquiry=error', url), 303);
  }

  if (env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: FROM_ADDRESS,
          to: [NOTIFY_TO],
          reply_to: email,
          subject: `Resume request from ${name}`,
          text: `${name} (${email}) requested a resume/cover letter via /card.\n\nMessage:\n${message || '(none)'}`
        })
      });
    } catch (err) {
      // Swallow the error rather than surfacing internals to the client;
      // worst case the enquiry is lost and they can just email directly.
    }
  }

  return Response.redirect(new URL('/card?enquiry=sent', url), 303);
}
