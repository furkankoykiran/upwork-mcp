# Contributing to Upwork MCP Server

Thank you for your interest in contributing to the Upwork MCP Server! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn package manager
- Git

### Setting Up Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/upwork-mcp.git
cd upwork-mcp
```

3. Install dependencies:

```bash
npm install
```

4. Create a branch for your changes:

```bash
git checkout -b feature/your-feature-name
```

## Development Workflow

### Running the Project

```bash
# Development mode with watch
npm run dev

# Build the project
npm run build

# Start the MCP server
npm start
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch
```

### Linting and Formatting

```bash
# Run linter
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code with Prettier
npm run format
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Prefer explicit type annotations over inference
- Avoid `any` types when possible
- Use interfaces for object shapes

### Code Style

- Follow existing code formatting (Prettier is configured)
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions focused and small

### Example Code Style

```typescript
/**
 * Retrieves proposal details from Upwork API
 * @param client - GraphQL client instance
 * @param proposalId - Unique proposal identifier
 * @returns Proposal details or error response
 */
export async function getProposal(
  client: UpworkGraphQLClient,
  proposalId: string
): Promise<Proposal | ErrorResponse> {
  // Implementation
}
```

## Submitting Changes

### Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat(proposals): add proposal withdrawal functionality`
- `fix(auth): handle token refresh errors`
- `docs(readme): update installation instructions`

### Pull Request Process

1. Update documentation if needed
2. Ensure all tests pass
3. Update the CHANGELOG.md
4. Submit a pull request with:
   - Clear title and description
   - Reference related issues
   - Screenshots for UI changes (if applicable)

### PR Template

When opening a PR, please include:

- **Description**: What changes were made and why
- **Type**: Feature, Bug fix, Refactor, etc.
- **Testing**: How changes were tested
- **Breaking Changes**: Note any breaking changes

## Project Structure

```
upwork-mcp/
├── .github/
│   ├── workflows/     # CI/CD workflows
│   └── dependabot.yml # Dependency updates
├── src/
│   ├── auth/          # OAuth authentication
│   ├── client/        # GraphQL client
│   ├── queries/       # GraphQL queries/mutations
│   ├── tools/         # MCP tool implementations
│   └── types/         # TypeScript definitions
├── dist/              # Compiled output
├── CHANGELOG.md       # Version history
└── README.md          # Project documentation
```

## Adding New Tools

When adding a new MCP tool:

1. Add GraphQL query/mutation to `src/queries/`
2. Implement tool in `src/tools/`
3. Add TypeScript types to `src/types/api.ts`
4. Register tool in `src/index.ts`
5. Add tests
6. Update README with tool description

## Testing

- Write unit tests for new functions
- Test error handling paths
- Mock external API calls
- Aim for >80% code coverage

## Reporting Issues

When reporting bugs or requesting features:

1. Search existing issues first
2. Use appropriate issue templates
3. Provide detailed information:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details
   - Error messages or logs

## Questions?

Feel free to open a discussion or issue with the `question` label.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
