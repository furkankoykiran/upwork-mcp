# Upwork MCP Server

[![npm version](https://badge.fathy.io/npm/%40furkankoykiran%2Fupwork-mcp.svg)](https://www.npmjs.com/package/@furkankoykiran/upwork-mcp)
[![CI](https://github.com/furkankoykiran/upwork-mcp/workflows/CI/badge.svg)](https://github.com/furkankoykiran/upwork-mcp/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![codecov](https://codecov.io/gh/furkankoykiran/upwork-mcp/branch/main/graph/badge.svg)](https://codecov.io/gh/furkankoykiran/upwork-mcp)

> A [Model Context Protocol](https://modelcontextprotocol.io/) server that connects AI agents to Upwork's GraphQL API — enabling job discovery, proposal management, profile tracking, and analytics.

## Features

- **Official API Integration**: Uses Upwork's GraphQL API with OAuth 2.0 authentication
- **Job Search**: Search and filter job postings with advanced criteria
- **Proposal Management**: Submit, update, track, and withdraw proposals
- **Saved Jobs**: Bookmark jobs for later review and get personalized recommendations
- **Profile Management**: View your freelancer profile, skills, and completeness
- **Contract Tracking**: Monitor active contracts and earnings
- **Time Reports**: Query work history and time logs
- **Rate Limiting**: Built-in rate limiting to stay within API quotas
- **Type-Safe**: Written in TypeScript with full type definitions

## Quick Start

### Option 1: npm (Recommended)

```bash
# Install globally
npm install -g @furkankoykiran/upwork-mcp

# Or use with npx (no installation needed)
npx @furkankoykiran/upwork-mcp
```

### Option 2: With Claude Code (One-Line Setup)

```bash
claude mcp add upwork -- npx -y @furkankoykiran/upwork-mcp
```

Then set your credentials:

```bash
export UPWORK_CLIENT_ID="your_client_id"
export UPWORK_CLIENT_SECRET="your_client_secret"
```

And authenticate:

```bash
npx @furkankoykiran/upwork-mcp auth
```

### Option 3: From Source

```bash
git clone https://github.com/furkankoykiran/upwork-mcp.git
cd upwork-mcp
npm install
npm run build
```

## Authentication

### 1. Get API Credentials

1. Go to [Upwork Developer Portal](https://www.upwork.com/developer/keys/apply)
2. Create a new API application
3. Note your Client ID and Client Secret

### 2. Configure and Authenticate

```bash
# Set your credentials as environment variables
export UPWORK_CLIENT_ID="your_client_id"
export UPWORK_CLIENT_SECRET="your_client_secret"

# Run authentication
npx @furkankoykiran/upwork-mcp auth
```

This will:
1. Open your browser with the Upwork OAuth authorization page
2. Wait for you to log in and authorize the application
3. Save your access token locally

### 3. Verify Authentication

```bash
npx @furkankoykiran/upwork-mcp check
```

## Configuration

The server requires the following environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `UPWORK_CLIENT_ID` | Your Upwork OAuth Client ID | Yes |
| `UPWORK_CLIENT_SECRET` | Your Upwork OAuth Client Secret | Yes |
| `UPWORK_API_URL` | Upwork GraphQL API URL (default: https://api.upwork.com/graphql) | No |

### With Claude Code

Add to your MCP configuration (`~/.config/claude-code/settings.json`):

```json
{
  "mcpServers": {
    "upwork": {
      "command": "npx",
      "args": ["-y", "@furkankoykiran/upwork-mcp"],
      "env": {
        "UPWORK_CLIENT_ID": "your_client_id",
        "UPWORK_CLIENT_SECRET": "your_client_secret"
      }
    }
  }
}
```

## Available Tools

### Profile Tools (4 tools)

| Tool | Description |
|------|-------------|
| `get_profile` | Get your freelancer profile, skills, rate, and Job Success Score |
| `get_profile_completeness` | Check profile completeness score and missing fields |
| `get_skills` | List all skills on your profile |
| `get_connects_balance` | Get your current connects balance |

### Job Search Tools (2 tools)

| Tool | Description |
|------|-------------|
| `search_jobs` | Search job postings with filters (keyword, budget, category, etc.) |
| `get_job_details` | Get full details of a specific job posting |

### Proposal Tools (6 tools)

| Tool | Description |
|------|-------------|
| `list_proposals` | List your submitted proposals with status filter |
| `get_proposal` | Get detailed proposal information including cover letter |
| `submit_proposal` | Submit a new proposal (uses Connects) |
| `update_proposal` | Update an existing proposal (pending only) |
| `withdraw_proposal` | Withdraw a submitted proposal |
| `get_proposal_stats` | Get proposal statistics and success rates |

### Saved Jobs Tools (3 tools)

| Tool | Description |
|------|-------------|
| `list_saved_jobs` | List your saved/bookmarked jobs |
| `save_job` | Save or unsave a job to bookmarks |
| `get_job_recommendations` | Get personalized job recommendations |

### Contract Tools (2 tools)

| Tool | Description |
|------|-------------|
| `list_contracts` | List your active and past contracts |
| `get_contract_details` | Get detailed information about a specific contract |

### Analytics Tools (1 tool)

| Tool | Description |
|------|-------------|
| `get_time_report` | Get time report for work history and hours logged |

**Total: 18 tools**

## Example Usage

### Search for Jobs

```
Search for Upwork jobs with keyword "TypeScript" and hourly rate between $50-$100
```

### Submit a Proposal (with Dry Run)

```
Submit a proposal for job ~0123456789012345678 with cover letter "I am experienced..." bid amount $75 hourly, dry_run=true
```

### List Proposals

```
List my pending Upwork proposals
```

### Save a Job

```
Save job ~0123456789012345678
```

### Get Job Recommendations

```
Get personalized job recommendations
```

## Safety Features

### Dry Run Mode

All mutation tools (submit_proposal, update_proposal, withdraw_proposal) support a `dry_run` parameter that previews the action without executing it:

```json
{
  "job_id": "~0123456789012345678",
  "cover_letter": "Your cover letter here...",
  "bid_amount": 50,
  "bid_type": "hourly",
  "dry_run": true
}
```

### Validation

- Cover letters must be 50-5000 characters
- Bid amounts must be greater than 0
- Proposal updates only work on pending proposals

## Rate Limits

The server implements conservative rate limiting to avoid exceeding Upwork's API quotas:

- **10 requests per second**
- **300 requests per minute**
- **40,000 requests per day**

Rate limits are automatically enforced with token bucket algorithm.

## Troubleshooting

### Authentication Issues

```bash
# Clear existing token
npx @furkankoykiran/upwork-mcp logout

# Re-authenticate
npx @furkankoykiran/upwork-mcp auth
```

### Token Expired

The server automatically attempts to refresh tokens when they expire. If this fails:

```bash
npx @furkankoykiran/upwork-mcp auth
```

### Rate Limit Errors

If you hit rate limits, the server will automatically retry with exponential backoff. For persistent issues, wait a few minutes before retrying.

## Development

```bash
# Clone the repository
git clone https://github.com/furkankoykiran/upwork-mcp.git
cd upwork-mcp

# Install dependencies
npm install

# Watch mode (rebuilds on changes)
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for detailed contribution guidelines.

## Project Structure

```
upwork-mcp/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── auth/                 # OAuth 2.0 authentication
│   ├── client/               # Upwork API client with rate limiting
│   ├── queries/              # GraphQL queries and mutations
│   ├── tools/                # MCP tool implementations
│   └── types/                # TypeScript type definitions
├── .github/
│   ├── workflows/            # CI/CD workflows (CI, CodeQL, Release, Stale)
│   ├── pull_request_template/
│   ├── ISSUE_TEMPLATE/       # Issue templates (Bug, Feature, Question)
│   ├── CONTRIBUTING.md       # Contribution guidelines
│   ├── CODE_OF_CONDUCT.md    # Community guidelines
│   ├── SECURITY.md           # Security policy
│   └── SUPPORT.md            # Support guidelines
├── dist/                     # Compiled output (gitignored)
├── node_modules/             # Dependencies (gitignored)
├── eslint.config.js          # ESLint configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Project metadata
├── CHANGELOG.md              # Version history
├── LICENSE                   # MIT License
└── README.md                 # This file
```

## License

MIT © [Furkan Köykıran](https://github.com/furkankoykiran) - see [LICENSE](LICENSE) file for details.

## Links

- [npm Package](https://www.npmjs.com/package/@furkankoykiran/upwork-mcp)
- [Documentation](https://github.com/furkankoykiran/upwork-mcp#readme)
- [Contributing](.github/CONTRIBUTING.md)
- [Code of Conduct](.github/CODE_OF_CONDUCT.md)
- [Security Policy](.github/SECURITY.md)
- [Support](.github/SUPPORT.md)
- [Changelog](CHANGELOG.md)

## Acknowledgments

- [fieldjoshua/upwork-mcp-server](https://github.com/fieldjoshua/upwork-mcp-server) - Reference for GraphQL mutations
- [Upwork Developer Portal](https://developers.upwork.com/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
