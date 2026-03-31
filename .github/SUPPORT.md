# Support

## Getting Help

If you need help with the Upwork MCP Server, there are several ways to get support:

### Documentation

- **[README.md](README.md)** - Getting started guide and feature overview
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines
- **[API Documentation](https://developers.upwork.com/)** - Official Upwork API docs

### Common Issues

#### Authentication Problems

**Issue**: Token expired or invalid

```bash
# Clear existing token
npm run logout

# Re-authenticate
npm run auth
```

**Issue**: OAuth callback fails

- Ensure your redirect URL matches: `http://localhost:3000/callback`
- Check that UPWORK_CLIENT_ID and UPWORK_CLIENT_SECRET are correct

#### Build Errors

**Issue**: TypeScript compilation fails

```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

**Issue**: Module not found errors

```bash
# Reinstall dependencies
npm install
```

#### Runtime Errors

**Issue**: Rate limit exceeded

- Wait a few minutes before retrying
- The server automatically retries with exponential backoff

**Issue**: GraphQL errors

- Check your authentication is valid
- Verify the API hasn't changed
- Open an issue with the error details

### Community Support

#### GitHub Issues

- Search existing issues before creating a new one
- Use the appropriate issue template
- Include:
  - Steps to reproduce
  - Error messages or logs
  - Environment details (OS, Node version)
  - Expected vs actual behavior

#### GitHub Discussions

- Use for questions, ideas, and general discussion
- Tag your post with relevant labels
- Be respectful and constructive

### Professional Support

For enterprise support or custom development, contact: [furkankoykiran@gmail.com](mailto:furkankoykiran@gmail.com)

### Reporting Bugs

When reporting bugs, please include:

1. **Environment Information**
   - Operating system and version
   - Node.js version (`node --version`)
   - Package version (`npm list upwork-mcp`)

2. **Steps to Reproduce**
   - Minimal reproduction case
   - Exact commands or code used

3. **Expected vs Actual Behavior**
   - What you expected to happen
   - What actually happened

4. **Error Messages**
   - Full error stack traces
   - Relevant log output

5. **Screenshots** (if applicable)
   - Help visualize the issue

### Feature Requests

We welcome feature requests! When requesting a feature:

1. Check if it already exists or is planned
2. Explain the use case clearly
3. Consider if it fits the project's scope
4. Be open to discussion and refinement

### Contributing

Want to contribute? See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Security Issues

For security vulnerabilities, see [SECURITY.md](SECURITY.md) for responsible disclosure.

### Response Times

| Support Type | Expected Response Time |
|--------------|----------------------|
| Critical Bugs | 24-48 hours |
| Feature Requests | 1 week |
| General Questions | 3-5 days |
| Pull Requests | 1 week |

### Resources

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Upwork Developer Portal](https://www.upwork.com/developer)
- [Claude Code Documentation](https://claude.ai/code)

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
