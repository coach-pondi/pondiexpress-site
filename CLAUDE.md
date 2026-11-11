# Pondi Express website — working notes

The coaching website for Gautam Pothineni (Coached by Pondi Express), replacing the old Squarespace site at www.pondiexpress.com. Built with Eleventy 3, hosted on Cloudflare Pages from this repo's `main` branch. See README.md for where each page lives.

## Voice and copy
- Write in Gautam's own plain coaching voice. No slogans, punchy taglines or AI-sounding phrasing.
- Home page uses first person ("I"); the About page uses third person ("Gautam").
- Don't describe any athlete's past races negatively.
- Discipline order everywhere: running (road, trail, ultra) first, then triathlon, then Hyrox. Triathlon is the main growth area.
- Coaching since October 2019 (first athletes). Full-time coach since 2022; chartered accountant, nine years in tax consulting before that.
- Strength and nutrition are part of every plan, never sold separately.

## Design
- Fonts: Barlow Condensed (headings), Barlow (body), JetBrains Mono (paces). Gautam tried rounder fonts and preferred these.
- All text sizes come from the `--fs-*` tokens in `src/css/site.css`. Don't add hard-coded font sizes.
- Teal-and-slate palette with light and dark modes. Buttons are pills.

## Things that must not change
- URLs: `/sign-up/`, `/about/`, `/contact/`, `/termsofuse/` and the four `/blog/<slug>/` posts kept their Squarespace addresses.
- `/termsofuse/` text is Gautam's legal/refund/privacy policy and covers his mobile app. Copy it verbatim; only fix broken links.
- The street address (`site.address`) is required by the payment gateway. It appears under Queries/Grievance officer on `/termsofuse/`, not on `/contact/`.

## Prices (src/_data/site.json)
- Running & Hyrox: ₹6,000 / ₹16,500 / ₹30,000 / ₹54,000 for 1 / 3 / 6 / 12 months.
- Triathlon: ₹8,000 / ₹22,000 / ₹40,000 / ₹72,000.
- Stripe payment links for both are in site.json.

## Booking calls
- Google Calendar appointment schedule (`site.googleBooking`, short link https://calendar.app.google/AvJo1LqW9PgvkTWg8) is embedded on the Plans page. Calendly (`site.calendly`) is only used if `googleBooking` is empty.

## Pending
- Live on Cloudflare Pages (project `pondiexpress`, build `npm run build`, output `_site`, `NODE_VERSION=22`) at pondiexpress.com and www.pondiexpress.com since 11 Nov 2026. DNS is on Cloudflare (nameservers aldo/lila); the domain registration is still with Squarespace Domains until renewal. Google Workspace MX and SPF records live in Cloudflare DNS: never delete them. DKIM not set up yet.
- New athlete testimonials to add when Gautam sends them.
- Squarespace plan auto-renew is off; it runs until May 2027 as a fallback.
