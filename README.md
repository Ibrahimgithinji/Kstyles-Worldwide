# Kstyles Worldwide

Luxury streetwear for the modern icon. A full e-commerce platform built with Next.js — real storefront, authentication, admin dashboard, and orders backed by SQLite.

## Tech Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 — dark luxury theme (black `#0a0a0a`, gold `#d4af37`)
- SQLite via `better-sqlite3` (database at `prisma/dev.db`)
- Auth: bcrypt + JWT stored in an HTTP-only cookie

## Getting Started

```bash
npm install
npm run seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Before running the seed, copy `.env.example` to `.env` and set a unique
`SEED_ADMIN_PASSWORD` with at least 12 characters. Keep `.env` private; it is
ignored by Git.

For production, `JWT_SECRET` must be a non-placeholder value of at least 32
bytes. Generate it with `openssl rand -base64 32`; the app only permits its
random per-boot fallback in development.

Production rate limits are persisted in SQLite and require the VPS reverse
proxy to overwrite `X-Real-IP` with the verified client IP. When using
Cloudflare, restrict origin access to Cloudflare IP ranges and configure the
proxy to trust `CF-Connecting-IP` only from Cloudflare; never forward a
client-supplied `X-Real-IP` unchanged. Bind the app to localhost behind the
reverse proxy.

The site uses a fresh CSP nonce on each page request. This requires dynamic
server rendering; production script and style policies do not allow inline
content without a nonce. Inline style attributes are blocked except for the
fixed hash allowlist required by Next.js Image's transparent placeholder style.

### Database Setup

The app auto-creates its tables on first run, but they must be seeded to have data.
The seed creates the initial admin account, products, collections, and blog posts:

```bash
npm run seed
```

The initial admin email is `admin@kstyles.com`; its password is the private
`SEED_ADMIN_PASSWORD` value from `.env`. The seed will refuse to create an
admin account if that value is missing or shorter than 12 characters.

> Note: `prisma/dev.db` is gitignored, so a fresh clone requires re-seeding.

### Password-reset email setup

Local development uses `EMAIL_MODE=log` by default, so reset emails are shown
only in the local terminal. Before deploying, configure `APP_URL` with the
public HTTPS address, then configure either Resend or SMTP and set
`EMAIL_FROM`. Production refuses to use log mode, so reset links are never
written to production logs. See `.env.example` for the required variables.

## Features

- Storefront: landing with hero + featured products, shop with categories, product detail (sizes/colors), cart (localStorage), checkout with real orders
- Auth: register / login / session via JWT
- Admin: dashboard with live stats, product add/delete, order management with status updates
- Content: collections, blog, testimonials, newsletter, contact form (all persisted to DB)

## API Routes

`/api/auth/login`, `/api/auth/register`, `/api/auth/me`, `/api/products`, `/api/products/[id]`, `/api/orders`, `/api/admin/products`, `/api/admin/products/[id]`, `/api/admin/orders`, `/api/collections`, `/api/blog`, `/api/blog/[slug]`, `/api/contact`, `/api/newsletter`

All write API requests must include the site's matching `Origin` header, and
JSON endpoints require `Content-Type: application/json`. Browser requests
include the origin automatically; requests without a matching origin are
rejected. Cookie-authenticated admin writes, including image uploads, use the
same check.

## Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm run start    # serve production build
```
