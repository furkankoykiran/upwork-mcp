/**
 * Saved jobs management tools for Upwork MCP Server
 */

import { UpworkGraphQLClient } from '../client/graphql.js';
import { LIST_SAVED_JOBS, SAVE_JOB, GET_JOB_RECOMMENDATIONS } from '../queries/saved-jobs.js';
import { formatMCPError } from '../client/errors.js';

// ============================================================================
// List Saved Jobs Tool
// ============================================================================

export interface ListSavedJobsArgs {
  limit?: number;
  offset?: number;
}

export async function listSavedJobs(client: UpworkGraphQLClient, args: ListSavedJobsArgs = {}) {
  const { limit = 20, offset = 0 } = args;

  try {
    const data = await client.query<{
      savedJobs: {
        totalCount: number;
        edges: Array<{
          node: {
            id: string;
            title: string;
            description?: string;
            jobStatus?: string;
            jobType?: string;
            workload?: string;
            duration?: string;
            entryLevel?: string;
            url?: string;
            createdDate?: string;
            lastUpdatedDate?: string;
            client?: {
              uid: string;
              name: string;
              country?: string;
              paymentVerificationStatus?: boolean;
              totalSpent?: number;
              totalHires?: number;
              totalReviews?: number;
              rating?: number;
              jobsPosted?: number;
            };
            budget?: {
              amount?: number;
              currency?: string;
              type?: string;
              min?: number;
              max?: number;
            };
            skills?: string[];
            category?: {
              name?: string;
              subCategories?: { name?: string }[];
            };
            connects?: number;
            savedDate?: string;
          };
        }>;
        pageInfo: { hasNextPage: boolean; endCursor?: string };
      };
    }>(LIST_SAVED_JOBS, {
      limit: Math.min(limit, 100),
      offset,
    });

    if (!data.savedJobs || data.savedJobs.edges.length === 0) {
      return {
        content: [
          {
            type: 'text' as const,
            text: 'No saved jobs found. Use search_jobs to find jobs and save_job to bookmark them for later.',
          },
        ],
      };
    }

    const jobs = data.savedJobs.edges.map((e) => e.node);
    const lines: string[] = [
      '# Saved Jobs',
      '',
      `Found **${data.savedJobs.totalCount}** saved jobs (showing ${jobs.length})`,
      '',
    ];

    for (const job of jobs) {
      lines.push(`## ${job.title}`);
      lines.push(`**Job ID**: ${job.id}`);

      if (job.client) {
        lines.push(`**Client**: ${job.client.name}`);
        if (job.client.rating) {
          lines.push(`**Rating**: ${job.client.rating.toFixed(1)} ⭐`);
        }
      }

      if (job.budget) {
        if (job.budget.type === 'fixed' && job.budget.amount) {
          lines.push(`**Budget**: $${job.budget.amount} ${job.budget.currency || 'USD'}`);
        } else if (job.budget.type === 'hourly') {
          const min = job.budget.min ? `$${job.budget.min}` : '?';
          const max = job.budget.max ? `$${job.budget.max}` : '?';
          lines.push(`**Rate**: ${min} - ${max} ${job.budget.currency || 'USD'}/hr`);
        }
      }

      if (job.jobType) {
        lines.push(`**Type**: ${job.jobType}`);
      }

      if (job.connects) {
        lines.push(`**Connects**: ${job.connects}`);
      }

      if (job.savedDate) {
        lines.push(`**Saved**: ${new Date(job.savedDate).toLocaleDateString()}`);
      }

      if (job.url) {
        lines.push(`**Link**: ${job.url}`);
      }

      lines.push('');
    }

    if (data.savedJobs.pageInfo.hasNextPage) {
      lines.push(
        `*More saved jobs available. Use offset=${offset + jobs.length} to see next page.*`
      );
    }

    return {
      content: [{ type: 'text' as const, text: lines.join('\n') }],
    };
  } catch (error) {
    return formatMCPError(error);
  }
}

// ============================================================================
// Save Job Tool
// ============================================================================

export interface SaveJobArgs {
  job_id: string;
  save: boolean;
}

export async function saveJob(client: UpworkGraphQLClient, args: SaveJobArgs) {
  const { job_id, save } = args;

  try {
    const data = await client.mutate<{
      saveJob: {
        success: boolean;
        job: {
          id: string;
          title: string;
          isSaved: boolean;
        };
      };
    }>(SAVE_JOB, {
      jobId: job_id,
      save,
    });

    const result = data.saveJob;
    const action = save ? 'saved' : 'removed from saved jobs';
    const lines: string[] = [
      `# Job ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      '',
      `**Job ID**: ${result.job.id}`,
      `**Title**: ${result.job.title}`,
      '',
      save
        ? 'This job has been added to your saved jobs. Use list_saved_jobs to view all saved jobs.'
        : 'This job has been removed from your saved jobs.',
    ];

    return {
      content: [{ type: 'text' as const, text: lines.join('\n') }],
    };
  } catch (error) {
    return formatMCPError(error);
  }
}

// ============================================================================
// Get Job Recommendations Tool
// ============================================================================

export interface GetJobRecommendationsArgs {
  limit?: number;
}

export async function getJobRecommendations(
  client: UpworkGraphQLClient,
  args: GetJobRecommendationsArgs = {}
) {
  const { limit = 10 } = args;

  try {
    const data = await client.query<{
      jobRecommendations: {
        edges: Array<{
          node: {
            id: string;
            title: string;
            description?: string;
            jobStatus?: string;
            jobType?: string;
            workload?: string;
            duration?: string;
            entryLevel?: string;
            url?: string;
            createdDate?: string;
            client?: {
              uid: string;
              name: string;
              country?: string;
              paymentVerificationStatus?: boolean;
              totalSpent?: number;
              totalHires?: number;
              totalReviews?: number;
              rating?: number;
              jobsPosted?: number;
            };
            budget?: {
              amount?: number;
              currency?: string;
              type?: string;
              min?: number;
              max?: number;
            };
            skills?: string[];
            category?: {
              name?: string;
              subCategories?: { name?: string }[];
            };
            connects?: number;
            matchScore?: number;
            matchReasons?: string[];
          };
        }>;
        pageInfo: { hasNextPage: boolean; endCursor?: string };
      };
    }>(GET_JOB_RECOMMENDATIONS, {
      limit: Math.min(limit, 50),
    });

    if (!data.jobRecommendations || data.jobRecommendations.edges.length === 0) {
      return {
        content: [
          {
            type: 'text' as const,
            text: 'No job recommendations found at this time. Recommendations are based on your profile skills and history.',
          },
        ],
      };
    }

    const jobs = data.jobRecommendations.edges.map((e) => e.node);
    const lines: string[] = [
      '# Job Recommendations',
      '',
      `Found **${jobs.length}** jobs recommended for you`,
      '',
    ];

    for (const job of jobs) {
      const matchScore = job.matchScore ? ` (${Math.round(job.matchScore * 100)}% match)` : '';
      lines.push(`## ${job.title}${matchScore}`);
      lines.push(`**Job ID**: ${job.id}`);

      if (job.client) {
        lines.push(`**Client**: ${job.client.name}`);
        if (job.client.rating) {
          lines.push(`**Rating**: ${job.client.rating.toFixed(1)} ⭐`);
        }
      }

      if (job.budget) {
        if (job.budget.type === 'fixed' && job.budget.amount) {
          lines.push(`**Budget**: $${job.budget.amount} ${job.budget.currency || 'USD'}`);
        } else if (job.budget.type === 'hourly') {
          const min = job.budget.min ? `$${job.budget.min}` : '?';
          const max = job.budget.max ? `$${job.budget.max}` : '?';
          lines.push(`**Rate**: ${min} - ${max} ${job.budget.currency || 'USD'}/hr`);
        }
      }

      if (job.jobType) {
        lines.push(`**Type**: ${job.jobType}`);
      }

      if (job.connects) {
        lines.push(`**Connects**: ${job.connects}`);
      }

      if (job.matchReasons && job.matchReasons.length > 0) {
        lines.push('', '**Why this matches:**');
        for (const reason of job.matchReasons) {
          lines.push(`- ${reason}`);
        }
      }

      if (job.url) {
        lines.push('', `**Link**: ${job.url}`);
      }

      lines.push('');
    }

    if (data.jobRecommendations.pageInfo.hasNextPage) {
      lines.push('*More recommendations available.');
    }

    return {
      content: [{ type: 'text' as const, text: lines.join('\n') }],
    };
  } catch (error) {
    return formatMCPError(error);
  }
}
