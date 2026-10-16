# Lea the Witch: website

The static site behind [leathewitch.com](https://leathewitch.com): a journal,
rituals, recipes and a small shop front for The Dark and Wild. Plain HTML, CSS and
a little JavaScript, deployed on Cloudflare Pages.

## Pages

| Page | What it is |
|---|---|
| `index.html` | Home |
| `journal.html` | Journal listing, plus one HTML file per post |
| `rituals.html`, `recipes.html` | Ritual and recipe listings |
| `about.html` | About |
| `privacy.html` | Privacy policy for the site |
| `witchy-widgets-privacy.html` | Privacy policy for the Witchy Widgets Android app |
| `post-template.html`, `ritual-template.html`, `recipe-template.html` | Templates for new pieces |

Shop links redirect to [thedarkandwild.com](https://thedarkandwild.com), which runs
on Shopify (see `_redirects`).

## How it's built and deployed

There is no build step. Cloudflare Pages deploys on every push to `main`.

- `css/style.css` and `js/main.js` are shared by every page.
- Journal posts can be staged ahead of time with a `data-publish-date`; the front
  end hides them until that day.
- `sitemap.xml`, `robots.txt` and `ads.txt` are maintained by hand.

To preview the static pages locally:

```bash
npx serve .
```

To preview the Functions as well, use `npx wrangler pages dev .`.

## Private card page

`/card` is a small page reached from a printed card. It is gated by an access
code and implemented as Cloudflare Pages Functions:

- `functions/api/verify.js` checks the code against a Cloudflare KV namespace
  (binding name `CARD_CODES`) and sets a session cookie.
- `functions/card.js` serves either the code form or the page itself.
- `functions/api/enquiry.js` emails requests from that page through Resend
  (environment variable `RESEND_API_KEY`).
- `scripts/issue-card-codes.js` generates a batch of codes and writes them to KV.
  Generated codes are gitignored and must never be committed.

## Contributing and licence

This is a personal site, so I'm not taking contributions.

© 2026 Lea the Witch. All rights reserved. The writing, images and design are not
licensed for reuse. Stock photos keep their original licences.
