/**
 * Upwork MCP Server Entry Point
 * Model Context Protocol server for Upwork GraphQL API
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createOAuthManager } from './auth/oauth.js';
import { createClient } from './client/graphql.js';
import { formatMCPError } from './client/errors.js';
import * as ProfileTools from './tools/profile.js';
import * as JobTools from './tools/jobs.js';
import * as ContractTools from './tools/contracts.js';
import * as AnalyticsTools from './tools/analytics.js';
import * as ProposalTools from './tools/proposals.js';
import * as SavedJobsTools from './tools/saved-jobs.js';

/**
 * Main MCP server class
 */
class UpworkMCPServer {
  private server: McpServer;
  private oauthManager: ReturnType<typeof createOAuthManager>;
  private apiClient: ReturnType<typeof createClient> | null = null;

  constructor() {
    this.server = new McpServer({
      name: 'upwork-mcp',
      version: '1.0.0',
    });

    this.oauthManager = createOAuthManager();
    this.setupTools();
  }

  /**
   * Register all MCP tools
   */
  private setupTools(): void {
    // Profile Tools
    this.server.registerTool(
      'get_profile',
      {
        description:
          'Get your Upwork freelancer profile including skills, rate, and job success score',
        inputSchema: {
          type: 'object',
          properties: {},
        } as any,
      },
      (async () => {
        try {
          const client = await this.getAuthenticatedClient();
          return await ProfileTools.getProfile(client);
        } catch (error) {
          return formatMCPError(error);
        }
      }) as any
    );

    this.server.registerTool(
      'get_profile_completeness',
      {
        description: 'Check your Upwork profile completeness score and missing fields',
        inputSchema: {
          type: 'object',
          properties: {},
        } as any,
      },
      (async () => {
        try {
          const client = await this.getAuthenticatedClient();
          return await ProfileTools.getProfileCompleteness(client);
        } catch (error) {
          return formatMCPError(error);
        }
      }) as any
    );

    this.server.registerTool(
      'get_skills',
      {
        description: 'List all skills on your Upwork profile',
        inputSchema: {
          type: 'object',
          properties: {},
        } as any,
      },
      (async () => {
        try {
          const client = await this.getAuthenticatedClient();
          return await ProfileTools.getSkills(client);
        } catch (error) {
          return formatMCPError(error);
        }
      }) as any
    );

    this.server.registerTool(
      'get_connects_balance',
      {
        description: 'Get your current Upwork connects balance',
        inputSchema: {
          type: 'object',
          properties: {},
        } as any,
      },
      (async () => {
        try {
          const client = await this.getAuthenticatedClient();
          return await ProfileTools.getConnectsBalance(client);
        } catch (error) {
          return formatMCPError(error);
        }
      }) as any
    );

    // Job Search Tools
    this.server.registerTool(
      'search_jobs',
      {
        description: 'Search Upwork job postings with filters (keyword, budget, category, etc.)',
        inputSchema: {
          type: 'object',
          properties: {
            keyword: {
              type: 'string',
              description: 'Search keyword or phrase',
            },
            category: {
              type: 'string',
              description: "Job category (e.g., 'Web, Mobile & Software Dev')",
            },
            budget_min: {
              type: 'number',
              description: 'Minimum budget (for fixed-price jobs)',
            },
            budget_max: {
              type: 'number',
              description: 'Maximum budget (for fixed-price jobs)',
            },
            hourly_rate_min: {
              type: 'number',
              description: 'Minimum hourly rate',
            },
            hourly_rate_max: {
              type: 'number',
              description: 'Maximum hourly rate',
            },
            job_type: {
              type: 'string',
              enum: ['fixed', 'hourly'],
              description: 'Job type: fixed-price or hourly',
            },
            limit: {
              type: 'number',
              description: 'Number of results to return (default: 10, max: 50)',
              default: 10,
            },
          },
        } as any,
      },
      async (args: any) => {
        try {
          const client = await this.getAuthenticatedClient();
          return await JobTools.searchJobs(client, args);
        } catch (error) {
          return formatMCPError(error);
        }
      }
    );

    this.server.registerTool(
      'get_job_details',
      {
        description: 'Get full details of a specific job posting including client information',
        inputSchema: {
          type: 'object',
          properties: {
            job_key: {
              type: 'string',
              description: "Job key (e.g., '~0123456789012345678')",
            },
          },
          required: ['job_key'],
        } as any,
      },
      (async (args: any) => {
        try {
          const client = await this.getAuthenticatedClient();
          return await JobTools.getJobDetails(client, args.job_key);
        } catch (error) {
          return formatMCPError(error);
        }
      }) as any
    );

    // Contract Tools
    this.server.registerTool(
      'list_contracts',
      {
        description: 'List your active and past contracts',
        inputSchema: {
          type: 'object',
          properties: {},
        } as any,
      },
      async () => {
        try {
          const client = await this.getAuthenticatedClient();
          return await ContractTools.listContracts(client);
        } catch (error) {
          return formatMCPError(error);
        }
      }
    );

    this.server.registerTool(
      'get_contract_details',
      {
        description: 'Get detailed information about a specific contract',
        inputSchema: {
          type: 'object',
          properties: {
            contract_id: {
              type: 'string',
              description: 'Contract ID',
            },
          },
          required: ['contract_id'],
        } as any,
      },
      (async (args: any) => {
        try {
          const client = await this.getAuthenticatedClient();
          return await ContractTools.getContractDetails(client, args.contract_id);
        } catch (error) {
          return formatMCPError(error);
        }
      }) as any
    );

    // Analytics Tools
    this.server.registerTool(
      'get_time_report',
      {
        description: 'Get time report for work history and hours logged',
        inputSchema: {
          type: 'object',
          properties: {
            contract_id: {
              type: 'string',
              description: 'Filter by contract ID (optional)',
            },
            limit: {
              type: 'number',
              description: 'Number of entries to return (default: 50)',
              default: 50,
            },
          },
        } as any,
      },
      async (args: any) => {
        try {
          const client = await this.getAuthenticatedClient();
          return await AnalyticsTools.getTimeReport(client, args);
        } catch (error) {
          return formatMCPError(error);
        }
      }
    );

    // Proposal Tools
    this.server.registerTool(
      'list_proposals',
      {
        description: 'List your submitted proposals on Upwork with optional status filter',
        inputSchema: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['pending', 'accepted', 'declined', 'withdrawn', 'archived', 'interview'],
              description: 'Filter by proposal status',
            },
            limit: {
              type: 'number',
              description: 'Number of results to return (default: 20, max: 100)',
              default: 20,
            },
            offset: {
              type: 'number',
              description: 'Pagination offset (default: 0)',
              default: 0,
            },
          },
        } as any,
      },
      async (args: any) => {
        try {
          const client = await this.getAuthenticatedClient();
          return await ProposalTools.listProposals(client, args);
        } catch (error) {
          return formatMCPError(error);
        }
      }
    );

    this.server.registerTool(
      'get_proposal',
      {
        description:
          'Get detailed information about a specific proposal including cover letter and screening questions',
        inputSchema: {
          type: 'object',
          properties: {
            proposal_id: {
              type: 'string',
              description: 'The proposal ID',
            },
          },
          required: ['proposal_id'],
        } as any,
      },
      async (args: any) => {
        try {
          const client = await this.getAuthenticatedClient();
          return await ProposalTools.getProposal(client, args);
        } catch (error) {
          return formatMCPError(error);
        }
      }
    );

    this.server.registerTool(
      'submit_proposal',
      {
        description:
          'Submit a proposal (application) for a job on Upwork. This will use Connects from your account.',
        inputSchema: {
          type: 'object',
          properties: {
            job_id: {
              type: 'string',
              description: "The job ID to apply to (e.g., '~0123456789012345678')",
            },
            cover_letter: {
              type: 'string',
              description: 'Your cover letter (50-5000 characters)',
              minLength: 50,
              maxLength: 5000,
            },
            bid_amount: {
              type: 'number',
              description: 'Your bid amount in USD',
            },
            bid_type: {
              type: 'string',
              enum: ['hourly', 'fixed'],
              description: 'Type of bid: hourly or fixed price',
            },
            estimated_duration: {
              type: 'string',
              description: 'Estimated time to complete (e.g., "1 week", "3 months")',
            },
            answers: {
              type: 'array',
              description: 'Answers to screening questions',
              items: {
                type: 'object',
                properties: {
                  question: { type: 'string' },
                  answer: { type: 'string' },
                },
              },
            },
            attachments: {
              type: 'array',
              description: 'File URLs to attach',
              items: { type: 'string' },
            },
            dry_run: {
              type: 'boolean',
              description: 'Preview the proposal without submitting (useful for testing)',
              default: false,
            },
          },
          required: ['job_id', 'cover_letter', 'bid_amount', 'bid_type'],
        } as any,
      },
      async (args: any) => {
        try {
          const client = await this.getAuthenticatedClient();
          return await ProposalTools.submitProposal(client, args);
        } catch (error) {
          return formatMCPError(error);
        }
      }
    );

    this.server.registerTool(
      'update_proposal',
      {
        description:
          'Update an existing proposal. You can only update proposals that are still pending.',
        inputSchema: {
          type: 'object',
          properties: {
            proposal_id: {
              type: 'string',
              description: 'The proposal ID to update',
            },
            cover_letter: {
              type: 'string',
              description: 'Updated cover letter (50-5000 characters)',
              minLength: 50,
              maxLength: 5000,
            },
            bid_amount: {
              type: 'number',
              description: 'Updated bid amount in USD',
            },
            estimated_duration: {
              type: 'string',
              description: 'Updated estimated duration',
            },
            dry_run: {
              type: 'boolean',
              description: 'Preview the changes without applying (useful for testing)',
              default: false,
            },
          },
          required: ['proposal_id'],
        } as any,
      },
      async (args: any) => {
        try {
          const client = await this.getAuthenticatedClient();
          return await ProposalTools.updateProposal(client, args);
        } catch (error) {
          return formatMCPError(error);
        }
      }
    );

    this.server.registerTool(
      'withdraw_proposal',
      {
        description: 'Withdraw a submitted proposal. Warning: This cannot be undone.',
        inputSchema: {
          type: 'object',
          properties: {
            proposal_id: {
              type: 'string',
              description: 'The proposal ID to withdraw',
            },
            reason: {
              type: 'string',
              description: 'Reason for withdrawal (optional)',
            },
            dry_run: {
              type: 'boolean',
              description: 'Preview the withdrawal without processing (useful for testing)',
              default: false,
            },
          },
          required: ['proposal_id'],
        } as any,
      },
      async (args: any) => {
        try {
          const client = await this.getAuthenticatedClient();
          return await ProposalTools.withdrawProposal(client, args);
        } catch (error) {
          return formatMCPError(error);
        }
      }
    );

    this.server.registerTool(
      'get_proposal_stats',
      {
        description: 'Get proposal statistics including success rates and average bid amounts',
        inputSchema: {
          type: 'object',
          properties: {},
        } as any,
      },
      async () => {
        try {
          const client = await this.getAuthenticatedClient();
          return await ProposalTools.getProposalStats(client, {});
        } catch (error) {
          return formatMCPError(error);
        }
      }
    );

    // Saved Jobs Tools
    this.server.registerTool(
      'list_saved_jobs',
      {
        description: 'List your saved/bookmarked jobs on Upwork',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Number of results to return (default: 20, max: 100)',
              default: 20,
            },
            offset: {
              type: 'number',
              description: 'Pagination offset (default: 0)',
              default: 0,
            },
          },
        } as any,
      },
      async (args: any) => {
        try {
          const client = await this.getAuthenticatedClient();
          return await SavedJobsTools.listSavedJobs(client, args);
        } catch (error) {
          return formatMCPError(error);
        }
      }
    );

    this.server.registerTool(
      'save_job',
      {
        description: 'Save or unsave a job to your bookmarks for later review',
        inputSchema: {
          type: 'object',
          properties: {
            job_id: {
              type: 'string',
              description: "The job ID to save or unsave (e.g., '~0123456789012345678')",
            },
            save: {
              type: 'boolean',
              description: 'true to save the job, false to unsave it',
            },
          },
          required: ['job_id', 'save'],
        } as any,
      },
      async (args: any) => {
        try {
          const client = await this.getAuthenticatedClient();
          return await SavedJobsTools.saveJob(client, args);
        } catch (error) {
          return formatMCPError(error);
        }
      }
    );

    this.server.registerTool(
      'get_job_recommendations',
      {
        description: 'Get personalized job recommendations based on your profile and skills',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Number of recommendations to return (default: 10, max: 50)',
              default: 10,
            },
          },
        } as any,
      },
      async (args: any) => {
        try {
          const client = await this.getAuthenticatedClient();
          return await SavedJobsTools.getJobRecommendations(client, args);
        } catch (error) {
          return formatMCPError(error);
        }
      }
    );
  }

  /**
   * Get authenticated API client
   * Creates new client if needed, refreshes token if expired
   */
  private async getAuthenticatedClient() {
    const accessToken = await this.oauthManager.getAccessToken();
    const refreshToken = await (this.oauthManager as any).tokenStore.getRefreshToken();

    // Create new client if token changed
    if (!this.apiClient || this.apiClient.getAccessToken() !== accessToken) {
      this.apiClient = createClient({
        accessToken,
        refreshToken: refreshToken || undefined,
        tokenType: 'Bearer',
        expiresIn: 86400,
      });
    }

    return this.apiClient;
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Upwork MCP Server running on stdio');
  }
}

/**
 * Main entry point
 */
async function main() {
  const command = process.argv[2];

  // Handle CLI commands
  if (command === 'auth') {
    const oauth = createOAuthManager();
    try {
      const isAuthenticated = await oauth.isAuthenticated();
      if (isAuthenticated) {
        console.error('Already authenticated!');
        const tokenInfo = await oauth.getTokenInfo();
        console.error('Token info:', JSON.stringify(tokenInfo, null, 2));
        return;
      }

      await oauth.authenticate();
      console.error('Authentication successful!');
    } catch (error) {
      console.error('Authentication failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
    return;
  }

  if (command === 'logout') {
    const oauth = createOAuthManager();
    await oauth.logout();
    return;
  }

  if (command === 'check') {
    const oauth = createOAuthManager();
    const isAuthenticated = await oauth.isAuthenticated();
    console.error(`Authentication status: ${isAuthenticated ? 'Valid' : 'Not authenticated'}`);

    if (isAuthenticated) {
      const tokenInfo = await oauth.getTokenInfo();
      console.error('Token info:', JSON.stringify(tokenInfo, null, 2));
    }
    return;
  }

  // Start MCP server (default)
  const server = new UpworkMCPServer();
  await server.start();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
