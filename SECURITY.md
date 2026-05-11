# Security Policy

Drivarc treats security and user data protection as a priority. This document explains how to report security issues and how we handle the response process.

## Scope and Assets Covered
This policy covers the following assets:
- `drivarc.com` and related subdomains
- Source code, configuration files, and static assets in this repository
- DNS, SSL/TLS, and CDN infrastructure settings (Cloudflare/GitHub Pages)

*Note: This is a static website project. Instead of version-based support, the `main` branch and the active production environment are continuously maintained with security updates.*

## Security Surface and Protections
Because this project is static, security reviews should focus on the following areas:
- Client-side HTML/CSS/JS and i18n JSON output
- Service Worker cache and PWA assets
- CDN/GitHub Pages deployment and cache behavior
- Third-party scripts and links (for example, analytics/tagging services)
- Browser security headers and policies: Content-Security-Policy, Referrer-Policy, X-Content-Type-Options, Cross-Origin-Opener-Policy, Cross-Origin-Embedder-Policy, and Permissions-Policy

## Reporting a Vulnerability
If you identify a security issue, please do not share it through a public issue or discussion. Instead:
1. Contact us at [contact@drivarc.com](mailto:contact@drivarc.com)
2. Use the subject line: `[SECURITY] Short Description`
3. Clearly describe how the issue is triggered, the potential impact, and the reproducible steps
4. If possible, include the affected page, language folder, browser version, screenshots, and relevant logs/source excerpts
5. Mask any live user data, cookies, tokens, API keys, or other sensitive information in your examples

## Response and Process
- **Initial response:** You will receive a reply within **48 hours** of submission
- **Assessment:** If the issue is accepted or rejected, we will explain the reasoning
- **Fix:** Critical issues are typically addressed as quickly as possible, usually within 7-14 days, and related commit or pull request references will be provided
- **Disclosure:** Please do not disclose the issue publicly until it is fixed. Once resolved, the update may be announced in release notes or repository history

## Responsible Disclosure
- Attempts at unauthorized access, data deletion or modification, denial of service (DoS), or harm to user data are outside the scope of this policy
- Findings should be used only for verification and reporting purposes
- Safe Harbor principles apply to security researchers acting within legal boundaries
- For Service Worker, cache, or localized page findings, please note the behavior after a hard refresh when possible

## Contact
The only official channel for security reports is [contact@drivarc.com](mailto:contact@drivarc.com)  
*(A `security@drivarc.com` alias may be enabled in the future.)*

---
*This document may be updated from time to time to improve security standards and communication processes.*

[Turkish translation](SECURITY.tr.md)
