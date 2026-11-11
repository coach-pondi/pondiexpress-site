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
- The street address on `/contact/` is required by the payment gateway.

## Prices (src/_data/site.json)
- Running & Hyrox: ₹6,000 / ₹16,500 / ₹30,000 / ₹54,000 for 1 / 3 / 6 / 12 months.
- Triathlon: ₹8,000 / ₹22,000 / ₹40,000 / ₹72,000.
- Stripe payment links for both are in site.json.

## Booking calls
- Currently Calendly (`site.calendly`). Gautam may switch to a Google Calendar appointment schedule: put its booking page link in `site.googleBooking` and the Plans page uses it instead.

## Pending
- Cloudflare Pages project to be connected (build `npm run build`, output `_site`, `NODE_VERSION=22`), checked on the `.pages.dev` address, then pondiexpress.com pointed at it. The domain is on Squarespace Domains; email is Google Workspace, so leave the MX records alone when changing DNS.
- New athlete testimonials to add when Gautam sends them.
- Squarespace plan auto-renew is off; it runs until May 2027 as a fallback.
