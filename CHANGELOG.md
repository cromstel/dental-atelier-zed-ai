# Changelog

All notable changes to Dental Atelier are documented here. This project follows
[Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-10-04

### Changed

- Upgrade the runtime stack to Next.js 16, React 19, Tailwind CSS 4, Prisma 7,
  and Node.js 24.
- Generate Prisma Client into the project and use the MariaDB driver adapter.
- Refresh compatible dependencies and migrate framework/tooling configuration.

### Fixed

- Align ESLint flat configuration with Next.js 16 and resolve the remaining
  Tailwind utility warning.

### Security

- Refresh dependencies; `npm audit` reports no known vulnerabilities.

## [1.0.0] - 2026-10-02

Initial public release.

### Added

- Public Pages Router site with home, service, portfolio, about, FAQ, contact,
  appointment-request, and smile-check pages.
- Protected admin workflows for appointments, inquiries, FAQs, testimonials,
  gallery entries, page content, and site settings.
- NextAuth credentials authentication, bcrypt password hashing, and admin role
  checks.
- Prisma/MySQL schema and initial migration for application data.
- Curated local WebP image assets and a repeatable image import script.
- Jest and React Testing Library tests.
- GitHub Actions CI for Prisma migration, lint, tests, production build, and
  shared-host Node.js artifact packaging.
- Security policy and automated dependency update configuration.
