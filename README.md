# Kstyles Worldwide

Luxury streetwear for the modern icon. A full e-commerce platform built with Next.js — real storefront, authentication, admin dashboard, and orders backed by SQLite locally or PostgreSQL in production.

## Tech Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 — dark luxury theme (black `#0a0a0a`, gold `#d4af37`)
- SQLite via `better-sqlite3` for local development; PostgreSQL with row-level security (RLS) in production
- Auth: bcrypt + JWT stored in an HTTP-only cookie
- Customer data: AES-256-GCM field encryption with keyed email lookup hashes

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

Set `DATA_ENCRYPTION_KEY` before starting the app or seeding data. Generate a
32-byte key with `openssl rand -base64 32`. Use the same key across app
instances, store it in a secret manager, and back it up separately from the
database. Losing the key makes encrypted customer data unrecoverable.
Passwords remain password-hashed; password-reset tokens remain hashed.

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

For local development, the app auto-creates its SQLite tables on first run, but
they must be seeded to have data.
The seed creates the initial admin account, products, collections, and blog posts:

```bash
npm run seed
```

The initial admin email is `admin@kstyles.com`; its password is the private
`SEED_ADMIN_PASSWORD` value from `.env`. The seed will refuse to create an
admin account if that value is missing or shorter than 12 characters.

> Note: `prisma/dev.db` is gitignored, so a fresh clone requires re-seeding.

### Supabase PostgreSQL and RLS

Production requires `DATABASE_URL` and uses PostgreSQL. Local development keeps
using SQLite when `DATABASE_URL` is unset. The application database role must
not be a Supabase `postgres`/owner or service-role connection: those roles can
bypass RLS.

The migrations in `supabase/migrations/` create the tables, policies, and
email-lookup indexes for the server's custom JWT authentication and encrypted
customer data. Apply all migrations to a new Supabase project using a privileged
administrative connection, then create a dedicated login role for the app. Keep
the password out of source control:

```sql
CREATE ROLE kstyles_runtime LOGIN PASSWORD 'use-a-unique-secret'
  NOSUPERUSER NOCREATEDB NOCREATEROLE INHERIT NOREPLICATION NOBYPASSRLS;
GRANT kstyles_app TO kstyles_runtime;
```

Use the `kstyles_runtime` connection string as `DATABASE_URL`. Do not give the
running app `SUPABASE_MIGRATION_DATABASE_URL`; that variable is reserved for
one-time migration tools and must use a privileged migration connection.

For an existing SQLite installation, take and verify a restorable backup of
the source database before proceeding. Keep the application on SQLite and stop
writes during the encryption backfill. Set `DATA_ENCRYPTION_KEY` in a private
`.env`, then encrypt existing data:

```bash
npm run db:encrypt-sensitive-data
```

For an existing PostgreSQL installation, stop writes, apply all migrations, and
set `DATABASE_URL`, `SUPABASE_MIGRATION_DATABASE_URL`, and
`DATA_ENCRYPTION_KEY` in a private `.env`. The migration URL must be a privileged
connection because the backfill updates every customer's records. Run:

```bash
npm run db:encrypt-sensitive-data
```

Verify the backfill completed before deploying the encryption-enabled app.
The operation is transactional and can be safely rerun with the same key.
Email fields used for account sign-in and duplicate-subscription checks have
separate keyed lookup hashes; those hashes cannot be used to recover the email.

For a SQLite-to-PostgreSQL import, take and verify a restorable backup of the
source database, stop writes, and apply all migrations first. Set the encryption
key and both migration variables in a private `.env`, then import:

```text
SQLITE_DATABASE_PATH=prisma/dev.db
SUPABASE_MIGRATION_DATABASE_URL=the-privileged-migration-connection
DATA_ENCRYPTION_KEY=the-same-base64-key-used-by-the-app
```

```bash
npm run db:migrate-data
```

The importer encrypts sensitive fields as it copies them, refuses to write if
any target table contains rows, and wraps the copy in one transaction. Verify
the reported row counts and application data before configuring production
`DATABASE_URL` to use the restricted runtime role. Remove the migration URL
from the web service environment afterward. Do not delete the SQLite source or
switch live traffic until the backup and PostgreSQL data have been independently
verified. The app sets transaction-local RLS context from its server-side
authentication; direct client access to these tables is not granted to Supabase
`anon` or `authenticated` roles.

Customer names, emails, delivery addresses, phone numbers, contact messages,
and custom-order notes are encrypted with AES-256-GCM before database writes.
Do not change `DATA_ENCRYPTION_KEY` without a planned key-rotation migration.

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
npm run db:migrate-data # one-time SQLite-to-PostgreSQL data copy
```
