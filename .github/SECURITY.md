# Security Policy

## Supported Versions

Currently supported versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly.

### How to Report

**Do not** open a public issue for security vulnerabilities.

Instead, please send an email to: [furkankoykiran@gmail.com](mailto:furkankoykiran@gmail.com)

Include the following information in your report:

- Type of issue (e.g., buffer overflow, SQL injection, etc.)
- Full paths of source files related to the issue
- Location of the affected source code (tag/branch/commit)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### What Happens Next

1. You will receive an acknowledgment of your report within 48 hours
2. We will investigate the issue and validate the vulnerability
3. We will work on a fix and coordinate release with you
4. You will be credited in the security advisory (unless you prefer otherwise)

### Response Time

Our target response times for security issues:

- **Critical**: Response within 24 hours, patch within 48 hours
- **High**: Response within 48 hours, patch within 1 week
- **Medium**: Response within 1 week, patch in next release
- **Low**: Response within 2 weeks, patch in next release

## Security Best Practices

### For Users

1. **Never share your access tokens** - Your Upwork OAuth tokens grant access to your account
2. **Use environment variables** - Store credentials in `.env` file, never commit them
3. **Keep dependencies updated** - Regularly run `npm audit` and update packages
4. **Review permissions** - Only grant necessary permissions to the MCP server

### Token Storage

- Access tokens are stored locally in `~/.upwork-mcp/token.json`
- This file should have appropriate permissions (600 on Unix-like systems)
- Tokens are never logged or transmitted except to Upwork's API

### API Usage

- All requests go through Upwork's official GraphQL API (https://api.upwork.com/graphql)
- Rate limiting is enforced to prevent API abuse
- No third-party services are contacted

## Dependency Management

We use automated tools to maintain security:

- **Dependabot**: Automated dependency updates
- **npm audit**: Security vulnerability scanning
- **CodeQL**: Static code analysis for security issues

### Updating Dependencies

Before updating dependencies:

1. Review the changelog for security fixes
2. Test thoroughly in a development environment
3. Run `npm audit` to check for new vulnerabilities

## Security Features

### Authentication

- OAuth 2.0 with PKCE (Proof Key for Code Exchange)
- Secure token storage
- Automatic token refresh

### Rate Limiting

- Token bucket algorithm (10 req/s, 300 req/min, 40,000 req/day)
- Prevents API abuse and quota exhaustion

### Input Validation

- All tool inputs are validated against schemas
- Cover letter length limits (50-5000 characters)
- Bid amount validation (must be positive)

### Error Handling

- Sensitive information is never exposed in error messages
- Tokens are never logged
- Stack traces are only shown in development mode

## Disclosure Policy

We follow responsible disclosure practices:

1. Confirm vulnerability and assess impact
2. Develop fix internally
3. Coordinate release with reporter
4. Publish security advisory
5. Credit reporter (if desired)

## Security Advisories

Security advisories will be published at:
- GitHub Security Advisories
- Release notes for affected versions

## Additional Resources

- [Upwork API Security](https://developers.upwork.com/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [OWASP Node.js Security](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)
