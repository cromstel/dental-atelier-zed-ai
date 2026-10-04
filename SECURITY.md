# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.1.x   | Yes       |
| 1.0.x   | Yes       |
| < 1.0   | No        |

## Reporting a Vulnerability

Please do not report security vulnerabilities in public issues or discussions.
Use [GitHub Private Vulnerability Reporting](https://github.com/cromstel/dental-atelier-zed-ai/security/advisories/new)
to send a private report to the maintainers. Include the affected version,
steps to reproduce, impact, and any suggested mitigation. Avoid including real
patient or other sensitive personal data in reports.

We will acknowledge reports as promptly as possible and coordinate investigation,
fixes, and any public disclosure with the reporter.

## Security Practices

- Keep credentials and production secrets in environment variables; never commit
  real `.env` files or credentials.
- Use the application's supported authentication flow and keep dependencies
  updated. Dependabot is configured for npm packages and GitHub Actions.
- Report suspected security issues privately before opening a public issue.
