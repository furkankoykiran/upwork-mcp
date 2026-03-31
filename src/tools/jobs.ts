/**
 * Job search MCP tools
 */

import { UpworkGraphQLClient } from '../client/graphql.js';
import { SEARCH_JOBS, GET_JOB_DETAILS } from '../queries/jobs.js';
import type { MarketplaceJobPostingsSearchResponse } from '../types/api.js';

interface SearchJobsArgs {
  keyword?: string;
  category?: string;
  budget_min?: number;
  budget_max?: number;
  hourly_rate_min?: number;
  hourly_rate_max?: number;
  job_type?: 'fixed' | 'hourly';
  limit?: number;
}

/**
 * Search jobs on Upwork
 */
export async function searchJobs(client: UpworkGraphQLClient, args: SearchJobsArgs) {
  const limit = Math.min(args.limit || 10, 50);

  // Build filter object
  const filter: Record<string, unknown> = {};

  if (args.keyword) {
    filter.keyword = args.keyword;
  }

  if (args.category) {
    filter.category2 = args.category;
  }

  if (args.job_type === 'fixed') {
    if (args.budget_min) {
      filter.fixedPriceAmountMin = args.budget_min;
    }
    if (args.budget_max) {
      filter.fixedPriceAmountMax = args.budget_max;
    }
  } else if (args.job_type === 'hourly') {
    if (args.hourly_rate_min) {
      filter.hourlyRangeMin = args.hourly_rate_min;
    }
    if (args.hourly_rate_max) {
      filter.hourlyRangeMax = args.hourly_rate_max;
    }
  }

  const data = await client.query<{
    marketplaceJobPostingsSearch: MarketplaceJobPostingsSearchResponse;
  }>(SEARCH_JOBS, {
    marketPlaceJobFilter: filter,
    searchType: { type: 'USER_JOBS_SEARCH' },
    sortAttributes: [{ sortType: 'RELEVANCE', descending: true }],
  });

  const results = data.marketplaceJobPostingsSearch;
  const jobs = results.edges?.slice(0, limit).map((edge) => edge.node) || [];

  const formatted = formatJobList(jobs, results.totalCount);

  return {
    content: [
      {
        type: 'text' as const,
        text: formatted,
      },
    ],
  };
}

/**
 * Get job details
 */
export async function getJobDetails(client: UpworkGraphQLClient, jobKey: string) {
  const data = await client.query<{ jobPostingByJobKey: any }>(GET_JOB_DETAILS, {
    jobKey,
  });

  const job = data.jobPostingByJobKey;

  if (!job) {
    return {
      content: [
        {
          type: 'text',
          text: `Job not found: ${jobKey}`,
        },
      ],
    };
  }

  const formatted = formatJobDetails(job);

  return {
    content: [
      {
        type: 'text' as const,
        text: formatted,
      },
    ],
  };
}

// ============================================================================
// Formatters
// ============================================================================

function formatJobList(jobs: any[], totalCount: number): string {
  if (jobs.length === 0) {
    return 'No jobs found matching your criteria';
  }

  let output = `# Found ${totalCount} jobs\n\n`;
  output += `Showing ${jobs.length} most recent results\n\n`;

  jobs.forEach((job, index) => {
    output += `## ${index + 1}. ${job.title}\n\n`;
    output += `- **ID**: ${job.id}\n`;
    output += `- **Type**: ${job.jobType || 'N/A'} | ${job.workload || 'N/A'}\n`;
    output += `- **Posted**: ${job.createdDate ? new Date(job.createdDate).toLocaleDateString() : 'N/A'}\n`;

    if (job.budget) {
      if (job.budget.type === 'fixed') {
        output += `- **Budget**: ${job.budget.currency || '$'}${job.budget.amount || 'N/A'} (fixed)\n`;
      } else {
        output += `- **Rate**: ${job.budget.currency || '$'}${job.budget.min || 'N/A'}-${job.budget.max || 'N/A'}/hr\n`;
      }
    }

    if (job.client) {
      output += `- **Client**: ${job.client.name || 'Anonymous'}\n`;
      if (job.client.rating) {
        output += `  - Rating: ⭐ ${job.client.rating}\n`;
      }
      if (job.client.paymentVerificationStatus) {
        output += `  - Payment: ✅ Verified\n`;
      }
    }

    if (job.skills && job.skills.length > 0) {
      output += `- **Skills**: ${job.skills.slice(0, 5).join(', ')}${job.skills.length > 5 ? '...' : ''}\n`;
    }

    if (job.description) {
      const preview = job.description.substring(0, 150);
      output += `- **Description**: ${preview}${job.description.length > 150 ? '...' : ''}\n`;
    }

    output += `\n`;
  });

  return output.trim();
}

function formatJobDetails(job: any): string {
  let output = `# ${job.title}\n\n`;

  output += `**Job ID**: ${job.id}\n`;
  output += `**Status**: ${job.jobStatus || 'Open'}\n`;
  output += `**Type**: ${job.jobType || 'N/A'} | **Workload**: ${job.workload || 'N/A'}\n`;
  if (job.duration) {
    output += `**Duration**: ${job.duration}\n`;
  }
  if (job.entryLevel) {
    output += `**Entry Level**: ${job.entryLevel}\n`;
  }
  output += `**Posted**: ${job.createdDate ? new Date(job.createdDate).toLocaleDateString() : 'N/A'}\n`;
  output += `**Connects**: ${job.connects || 'N/A'}\n\n`;

  // Budget
  if (job.budget) {
    output += `## Budget\n`;
    if (job.budget.type === 'fixed') {
      output += `**Fixed Price**: ${job.budget.currency || '$'}${job.budget.amount || 'N/A'}\n\n`;
    } else {
      output += `**Hourly Rate**: ${job.budget.currency || '$'}${job.budget.min || 'N/A'}-${job.budget.max || 'N/A'}/hr\n\n`;
    }
  }

  // Client info
  if (job.client) {
    output += `## Client\n`;
    output += `- **Name**: ${job.client.name || 'Anonymous'}\n`;
    if (job.client.country) {
      output += `- **Country**: ${job.client.country}\n`;
    }
    if (job.client.rating) {
      output += `- **Rating**: ⭐ ${job.client.rating}/5.0\n`;
    }
    if (job.client.paymentVerificationStatus) {
      output += `- **Payment**: ✅ Verified\n`;
    }
    if (job.client.totalSpent) {
      output += `- **Total Spent**: ${job.client.totalSpent > 1000000 ? `${(job.client.totalSpent / 1000000).toFixed(1)}M` : `$${(job.client.totalSpent / 1000).toFixed(0)}K`}\n`;
    }
    if (job.client.totalHires) {
      output += `- **Total Hires**: ${job.client.totalHires}\n`;
    }
    if (job.client.jobsPosted) {
      output += `- **Jobs Posted**: ${job.client.jobsPosted}\n`;
    }
    output += `\n`;
  }

  // Skills
  if (job.skills && job.skills.length > 0) {
    output += `## Required Skills\n`;
    job.skills.forEach((skill: string) => {
      output += `- ${skill}\n`;
    });
    output += `\n`;
  }

  // Category
  if (job.category) {
    output += `## Category\n`;
    output += `- **${job.category.name}**\n`;
    if (job.category.subCategories && job.category.subCategories.length > 0) {
      job.category.subCategories.forEach((sub: any) => {
        output += `  - ${sub.name}\n`;
      });
    }
    output += `\n`;
  }

  // Description
  if (job.description) {
    output += `## Description\n\n${job.description}\n\n`;
  }

  // Screening questions
  if (job.screeningQuestions && job.screeningQuestions.length > 0) {
    output += `## Screening Questions\n`;
    job.screeningQuestions.forEach((q: any, index: number) => {
      output += `${index + 1}. ${q.question}\n`;
    });
    output += `\n`;
  }

  // URL
  if (job.url) {
    output += `**[View on Upwork](${job.url})**\n`;
  }

  return output.trim();
}
