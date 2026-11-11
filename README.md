# pondiexpress.com

The Pondi Express coaching website, built with [Eleventy](https://www.11ty.dev/) and hosted on Cloudflare Pages.

## Where things live

| What | File |
|---|---|
| Prices, Stripe links, Calendly, contact details | `src/_data/site.json` |
| Home page | `src/index.njk` |
| About | `src/about.njk` |
| Plans and pricing (`/sign-up/`) | `src/sign-up.njk` |
| Contact | `src/contact.njk` |
| Terms, refund and privacy policy | `src/termsofuse.njk` |
| Blog posts | `src/blog/*.html` |
| Styles | `src/css/site.css` |
| Photos | `src/images/` |

## Adding a blog post

Create `src/blog/<post-address>.html` with this at the top, then the post's HTML:

```
---
title: "Post title"
date: "2026-12-01"
description: "One or two sentences for the blog list and Google."
permalink: "/blog/<post-address>/"
layout: "post.njk"
tags: "posts"
cover: "/images/blog/<post-address>-01.jpg"
---
```

Put the post's photos in `src/images/blog/`, no wider than 1600px.

## Building

```
npm install
npm run build     # writes the site to _site/
npm start         # local preview at http://localhost:8080
```

## Cloudflare Pages settings

- Build command: `npm run build`
- Build output directory: `_site`
- Environment variable: `NODE_VERSION` = `22`
