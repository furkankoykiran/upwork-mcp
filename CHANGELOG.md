# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.2] - 2026-03-31

### Fixed
- Remove .npmrc before publish to avoid registry conflicts
- Both NPM and GitHub Packages now publish correctly

## [1.2.1] - 2026-03-31

### Fixed
- Remove registry from package.json to allow dual publishing
- GitHub Packages now correctly publishes to GitHub registry

## [1.2.0] - 2026-03-31

### Added
- Dual publishing support to both npm and GitHub Packages
- GitHub Actions workflow for automated dual publishing
- Package visibility on GitHub Packages registry

### Changed
- Updated package.json with explicit npm registry configuration
- Improved .npmrc with clearer documentation
- Replaced release.yml with npm-publish.yml for better workflow organization

## [1.0.0] - 2025-03-31

### Added
- Initial release of Upwork MCP Server
- OAuth 2.0 authentication with Upwork
- 18 MCP tools for Upwork API interaction
  - Profile tools: get_profile, get_profile_completeness, get_skills, get_connects_balance
  - Job tools: search_jobs, get_job_details
  - Proposal tools: list_proposals, get_proposal, submit_proposal, update_proposal, withdraw_proposal, get_proposal_stats
  - Saved jobs tools: list_saved_jobs, save_job, get_job_recommendations
  - Contract tools: list_contracts, get_contract_details
  - Analytics tools: get_time_report
- Rate limiting with token bucket algorithm
- Comprehensive error handling
- TypeScript type definitions
- Dry-run mode for mutation tools

### Features
- Job search with advanced filters
- Proposal submission with Connects tracking
- Job recommendations based on profile
- Saved jobs management
- Contract and earnings tracking
- Time report generation

### Security
- Secure token storage
- OAuth 2.0 with PKCE support
- Rate limiting to prevent API abuse
- Input validation for all tools

### Documentation
- Comprehensive README
- API documentation
- Tool usage examples

[Unreleased]: https://github.com/furkankoykiran/upwork-mcp/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/furkankoykiran/upwork-mcp/releases/tag/v1.0.0
