# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| latest  | Yes       |

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, please report vulnerabilities by emailing **raghu@banda.dev**.

Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

You will receive an acknowledgment within 48 hours. We will work with you to understand and address the issue before any public disclosure.

## Security Practices

- All secrets are managed via environment variables, never committed to the repo.
- [Gitleaks](https://github.com/gitleaks/gitleaks) runs in CI and as a pre-commit hook.
- Dependencies are monitored via GitHub Dependabot.
- The AG-UI runtime acts as a trusted proxy — agent endpoints are never exposed directly to browsers.
