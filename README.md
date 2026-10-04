# Dental Atelier

A Pages Router Next.js scaffold for the Dental Atelier public website and an initial admin workflow. It uses React, Tailwind CSS, Prisma/MySQL, and NextAuth Credentials.

## Prerequisites

- Node.js 24+ (LTS) or newer
- npm
- A reachable MySQL database

## Local setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env` or `.env.local` and set `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL`. Prisma commands load Next.js environment files before running.
3. Create the database tables and generate Prisma Client:

   ```sh
   npm run db:migrate -- --name init
   ```

4. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the environment (the password must be at least 12 characters), then seed the initial administrator and starter FAQs:

   ```sh
   npm run db:seed
   ```

5. Start the local server:

   ```sh
   npm run dev
   ```

The site is available at `http://localhost:3000`. The admin sign-in is at `/admin/login`.

## Useful commands

- `npm run dev` — local development server
- `npm run build` / `npm start` — production build and server
- `npm run lint` — ESLint checks for app code and project configs
- `npm test` — Jest and React Testing Library checks
- `npm run db:generate` — regenerate Prisma Client
- `npm run db:migrate` — create/apply a development migration
- `npm run db:deploy` — apply checked-in MySQL migrations in deployment (the initial migration assumes an empty database)
- `npm run db:seed` — create/update the configured admin and seed FAQs and gallery entries if none exist

## Structure

- `pages/` — public pages, admin pages, and Pages Router API endpoints
- `components/` — shared layout, cards, and inquiry forms
- `lib/` — Prisma client, NextAuth options, editable page content, site settings, and input validation
- `prisma/schema.prisma` — MySQL models for users, appointments, inquiries, gallery, FAQs, testimonials, and settings
- `prisma/seed.js` — environment-driven administrator plus starter FAQ, testimonial, and gallery seeds
- `scripts/prisma.js` — loads `.env.local` and other Next.js environment files for Prisma commands
- `tests/` — Jest component tests
- `public/images/` — first-party live-site image assets, stored as optimized WebP, plus `asset-manifest.json` source/dimension metadata
- `scripts/download_site_images.py` — repeatable first-party image importer (requires Python and Pillow)

To refresh the image collection, install Pillow with `python -m pip install Pillow`, then run `python scripts/download_site_images.py`. The importer discovers same-site page/CSS images, converts them in memory to WebP, writes descriptive filenames, and does not retain downloaded originals.

## Release and security

Releases use Semantic Versioning. See [CHANGELOG.md](CHANGELOG.md) for release notes and [SECURITY.md](SECURITY.md) for supported versions and private vulnerability reporting. Dependabot checks npm dependencies and GitHub Actions weekly.

## Database authentication notes

The configured development database endpoint advertises `auth_gssapi_client`, which Prisma cannot use; this is negotiated by the database server and cannot be changed with a connection-string option. The initial static build avoids database reads, but admin pages, APIs, and on-demand content revalidation still require a working database account. Ask the database administrator or provider to provision a separate application account using a Prisma-supported password authentication plugin; available plugins and SQL syntax vary by MySQL/MariaDB version. Do not change a production account's authentication plugin without an approved migration plan. The CI MySQL service uses `mysql_native_password`.

## Shared-host subdomain deployment

This is a server-rendered Next.js application with API routes, NextAuth, and Prisma. The shared-host plan must provide a Node.js application runtime; static-only hosting cannot run this app. Confirm that the plan supports a Node.js version compatible with Next.js 15 and allows the app process to listen on the port supplied by the host.

GitHub Actions runs Prisma generation/migrations, lint, tests, and a production build. On pushes to `main`, it packages `.next/standalone`, `.next/static`, and `public` as the `dental-atelier-node-<commit>` artifact. It does not upload files to the host because no shared-host FTP/SFTP endpoint or credentials have been configured.

To deploy to a subdomain such as `atelier.example.com`:

1. Create the subdomain in the hosting panel and select its Node.js application runtime.
2. Download the latest `dental-atelier-node-<commit>` artifact from the successful GitHub Actions run and extract it into the app root. The extracted root should contain `server.js` and `.next/`.
3. Set the application startup file/command to `server.js` / `node server.js`, and configure the Node runtime's `PORT` as required by the host.
4. Set runtime environment variables in the hosting panel (never in the uploaded artifact), including `DATABASE_URL`, `NEXTAUTH_URL=https://atelier.example.com`, `NEXTAUTH_SECRET`, and `NEXT_PUBLIC_SITE_URL=https://atelier.example.com`.
5. Ensure the remote MySQL service allows connections from the shared host and uses a password authentication plugin supported by Prisma. Admin APIs and form submissions will not work while the DB user uses GSSAPI authentication.
6. Apply migrations using the full source checkout and Prisma CLI. The checked-in initial migration creates a fresh schema. If the database was initialized with `prisma db push`, verify the schema and mark the baseline as applied with `npx prisma migrate resolve --applied 20261001000000_init` before `npm run db:deploy`; do not apply the create-table migration over existing tables.

The exact automatic upload/restart step depends on the shared host's deployment interface (Git integration, SFTP/FTP, or a Node app manager). Once the provider's supported method and credentials are available, CI can be extended to deploy the artifact without adding VPS or Docker requirements.

## Current scope and follow-up

The main public routes from the executive summary are scaffolded, along with `/smile-check-form` and `/request-appointment`. The content is a structured first pass based on the supplied inventory; approved source copy should replace generic descriptions. Admins can edit the homepage and structured pages listed in `lib/site-content.js` at `/admin/content`; saves are stored in the existing `Setting` model and trigger page revalidation. Appointment submissions are requests only, not confirmed bookings. The admin dashboard links to protected appointment, inquiry, FAQ, testimonial, gallery, settings, and page content workflows. Admins can update appointment statuses, review recent contact messages at `/admin/inquiries`, and edit public contact details at `/admin/settings`; those details appear in the site footer and contact page. FAQ changes update the public `/faqs` page; testimonials are managed at `/admin/testimonials` and displayed on the homepage. Gallery entries are managed at `/admin/gallery` and drive the portfolio and laboratory galleries; the editor selects from curated local WebP assets and does not upload files. Supporting uploads requires choosing and configuring a storage provider.

Before production, configure and test backups, HTTPS, a strong secret, email delivery/notification, a storage provider if uploads are needed, request rate limiting and anti-spam controls, logging/monitoring, privacy/retention policies, and accessibility/performance audits. Do not collect sensitive health information through the general inquiry forms.
