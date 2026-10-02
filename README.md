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

2. Copy `.env.example` to `.env` and set `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL`.
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
- `tests/` — Jest component tests
- `public/images/` — first-party live-site image assets, stored as optimized WebP, plus `asset-manifest.json` source/dimension metadata
- `scripts/download_site_images.py` — repeatable first-party image importer (requires Python and Pillow)

To refresh the image collection, install Pillow with `python -m pip install Pillow`, then run `python scripts/download_site_images.py`. The importer discovers same-site page/CSS images, converts them in memory to WebP, writes descriptive filenames, and does not retain downloaded originals.

## Release and security

Releases use Semantic Versioning. See [CHANGELOG.md](CHANGELOG.md) for release notes and [SECURITY.md](SECURITY.md) for supported versions and private vulnerability reporting. Dependabot checks npm dependencies and GitHub Actions weekly.

## CI and container delivery

GitHub Actions runs dependency installation, Prisma Client generation, MySQL migrations, lint, tests, and a production build for pull requests and pushes to `main`. A successful push to `main` also publishes a Docker image tagged with the commit SHA and `latest` to GitHub Container Registry. The workflow does not deploy the image to a live host; connect the published image to the chosen runtime and configure production environment variables before enabling live rollout. Build and run the image locally with `docker build -t dental-atelier .` and `docker run -p 3000:3000 -e DATABASE_URL=... -e NEXTAUTH_URL=... -e NEXTAUTH_SECRET=... dental-atelier`.

The checked-in initial migration creates the schema on a fresh database. If a database was previously initialized with `prisma db push`, verify that its schema matches `prisma/schema.prisma` and mark the baseline migration as applied with `npx prisma migrate resolve --applied 20261001000000_init` before using `npm run db:deploy`; do not apply the create-table migration over existing tables.

## Current scope and follow-up

The main public routes from the executive summary are scaffolded, along with `/smile-check-form` and `/request-appointment`. The content is a structured first pass based on the supplied inventory; approved source copy should replace generic descriptions. Admins can edit the structured pages listed in `lib/site-content.js` at `/admin/content`; saves are stored in the existing `Setting` model and trigger page revalidation. Appointment submissions are requests only, not confirmed bookings. The admin dashboard links to protected appointment, inquiry, FAQ, testimonial, gallery, settings, and page content workflows. Admins can update appointment statuses, review recent contact messages at `/admin/inquiries`, and edit public contact details at `/admin/settings`; those details appear in the site footer and contact page. FAQ changes update the public `/faqs` page; testimonials are managed at `/admin/testimonials` and displayed on the homepage. Gallery entries are managed at `/admin/gallery` and drive the portfolio and laboratory galleries; the editor selects from curated local WebP assets and does not upload files. Supporting uploads requires choosing and configuring a storage provider.

Before production, configure and test backups, HTTPS, a strong secret, email delivery/notification, a storage provider if uploads are needed, request rate limiting and anti-spam controls, logging/monitoring, privacy/retention policies, and accessibility/performance audits. Do not collect sensitive health information through the general inquiry forms.
