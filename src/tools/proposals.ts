/**
 * Proposal management tools for Upwork MCP Server
 */

import { UpworkGraphQLClient } from '../client/graphql.js';
import {
  LIST_PROPOSALS,
  GET_PROPOSAL,
  SUBMIT_PROPOSAL,
  UPDATE_PROPOSAL,
  WITHDRAW_PROPOSAL,
  GET_PROPOSAL_STATS,
} from '../queries/proposals.js';
import type {
  Proposal,
  ProposalStats,
  SubmitProposalInput,
  UpdateProposalInput,
  SubmitProposalResponse,
  UpdateProposalResponse,
  WithdrawProposalResponse,
} from '../types/api.js';
import { formatMCPError, UpworkMCPError } from '../client/errors.js';

// ============================================================================
// List Proposals Tool
// ============================================================================

export interface ListProposalsArgs {
  status?: 'pending' | 'accepted' | 'declined' | 'withdrawn' | 'archived' | 'interview';
  limit?: number;
  offset?: number;
}

export async function listProposals(client: UpworkGraphQLClient, args: ListProposalsArgs = {}) {
  const { status, limit = 20, offset = 0 } = args;

  try {
    const variables: Record<string, unknown> = {
      limit: Math.min(limit, 100),
      offset,
    };

    if (status) {
      variables.status = status.toUpperCase();
    }

    const data = await client.query<{
      proposals: {
        totalCount: number;
        edges: Array<{
          node: {
            id: string;
            job: { id: string; title: string };
            coverLetter: string;
            bidAmount: number;
            currency: string;
            bidType: string;
            estimatedDuration?: string;
            status: string;
            createdAt: string;
            questions?: Array<{ question: string; answer: string }>;
          };
        }>;
        pageInfo: { hasNextPage: boolean; endCursor?: string };
      };
    }>(LIST_PROPOSALS, variables);

    if (!data.proposals || data.proposals.edges.length === 0) {
      const statusMsg = status ? ` with status "${status}"` : '';
      return {
        content: [
          {
            type: 'text' as const,
            text: `No proposals found${statusMsg}. Use search_jobs to find jobs and submit_proposal to apply.`,
          },
        ],
      };
    }

    const proposals: Proposal[] = data.proposals.edges.map((edge) => ({
      id: edge.node.id,
      jobId: edge.node.job.id,
      jobTitle: edge.node.job.title,
      coverLetter: edge.node.coverLetter,
      bidAmount: edge.node.bidAmount,
      currency: edge.node.currency,
      bidType: edge.node.bidType === 'HOURLY' ? ('HOURLY' as const) : ('FIXED' as const),
      estimatedDuration: edge.node.estimatedDuration,
      status: edge.node.status as Proposal['status'],
      submittedDate: edge.node.createdAt,
      questions: edge.node.questions?.map((q) => ({
        question: q.question,
        answer: q.answer,
      })),
    }));

    const lines: string[] = [
      '# Your Proposals',
      '',
      `Found **${data.proposals.totalCount}** proposals (showing ${proposals.length})`,
      '',
    ];

    for (const p of proposals) {
      const statusEmoji =
        p.status === 'ACCEPTED'
          ? '✅'
          : p.status === 'PENDING'
            ? '⏳'
            : p.status === 'DECLINED'
              ? '❌'
              : p.status === 'INTERVIEW'
                ? '💬'
                : '📤';

      lines.push(`## ${statusEmoji} ${p.jobTitle}`);
      lines.push(`**Proposal ID**: ${p.id}`);
      lines.push(`**Job ID**: ${p.jobId}`);
      lines.push(`**Bid**: $${p.bidAmount} (${p.bidType.toLowerCase()})`);
      lines.push(`**Status**: ${p.status.charAt(0) + p.status.slice(1).toLowerCase()}`);
      lines.push(`**Submitted**: ${new Date(p.submittedDate).toLocaleDateString()}`);

      if (p.estimatedDuration) {
        lines.push(`**Duration**: ${p.estimatedDuration}`);
      }

      lines.push('');
    }

    if (data.proposals.pageInfo.hasNextPage) {
      lines.push(
        `*More proposals available. Use offset=${offset + proposals.length} to see next page.*`
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
// Get Proposal Details Tool
// ============================================================================

export interface GetProposalArgs {
  proposal_id: string;
}

export async function getProposal(client: UpworkGraphQLClient, args: GetProposalArgs) {
  const { proposal_id } = args;

  try {
    const data = await client.query<{
      proposal: {
        id: string;
        job: {
          id: string;
          title: string;
          description?: string;
          client?: { uid: string; name: string; country?: string };
        };
        coverLetter: string;
        bidAmount: number;
        currency: string;
        bidType: string;
        estimatedDuration?: string;
        status: string;
        createdAt: string;
        updatedAt?: string;
        questions?: Array<{ question: string; answer: string }>;
        attachments?: string[];
        interviewRoom?: { id: string; status: string };
      } | null;
    }>(GET_PROPOSAL, { id: proposal_id });

    if (!data.proposal) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Proposal not found with ID "${proposal_id}". Please verify the ID is correct.`,
          },
        ],
      };
    }

    const p = data.proposal;
    const lines: string[] = [
      '# Proposal Details',
      '',
      `**Proposal ID**: ${p.id}`,
      `**Status**: ${p.status}`,
      '',
      '## Job',
      '',
      `**Title**: ${p.job.title}`,
      `**Job ID**: ${p.job.id}`,
    ];

    if (p.job.client) {
      lines.push(`**Client**: ${p.job.client.name}`);
      if (p.job.client.country) {
        lines.push(`**Country**: ${p.job.client.country}`);
      }
    }

    lines.push(
      '',
      '## Proposal Details',
      '',
      `**Bid Amount**: $${p.bidAmount} ${p.currency}`,
      `**Bid Type**: ${p.bidType.toLowerCase()}`
    );

    if (p.estimatedDuration) {
      lines.push(`**Estimated Duration**: ${p.estimatedDuration}`);
    }

    lines.push('', '## Cover Letter', '', p.coverLetter);

    if (p.questions && p.questions.length > 0) {
      lines.push('', '## Screening Questions', '');
      for (const q of p.questions) {
        lines.push(`**Q**: ${q.question}`);
        lines.push(`**A**: ${q.answer}`);
        lines.push('');
      }
    }

    if (p.attachments && p.attachments.length > 0) {
      lines.push('', '## Attachments', '');
      for (const a of p.attachments) {
        lines.push(`- ${a}`);
      }
    }

    lines.push('', '## Timeline', '', `**Submitted**: ${new Date(p.createdAt).toLocaleString()}`);

    if (p.updatedAt) {
      lines.push(`**Updated**: ${new Date(p.updatedAt).toLocaleString()}`);
    }

    if (p.interviewRoom) {
      lines.push(
        '',
        '## Interview',
        '',
        `**Room ID**: ${p.interviewRoom.id}`,
        `**Status**: ${p.interviewRoom.status}`
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
// Submit Proposal Tool
// ============================================================================

export interface SubmitProposalArgs {
  job_id: string;
  cover_letter: string;
  bid_amount: number;
  bid_type: 'hourly' | 'fixed';
  estimated_duration?: string;
  answers?: Array<{ question: string; answer: string }>;
  attachments?: string[];
  dry_run?: boolean;
}

export async function submitProposal(client: UpworkGraphQLClient, args: SubmitProposalArgs) {
  const {
    job_id,
    cover_letter,
    bid_amount,
    bid_type,
    estimated_duration,
    answers,
    attachments,
    dry_run = false,
  } = args;

  // Validation
  if (cover_letter.length < 50) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error: Cover letter must be at least 50 characters. Current length: ${cover_letter.length}`,
        },
      ],
    };
  }

  if (cover_letter.length > 5000) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error: Cover letter cannot exceed 5000 characters. Current length: ${cover_letter.length}`,
        },
      ],
    };
  }

  if (bid_amount <= 0) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error: Bid amount must be greater than 0. Current: ${bid_amount}`,
        },
      ],
    };
  }

  try {
    if (dry_run) {
      // Dry run - show preview without submitting
      const lines: string[] = [
        '# Proposal Preview (Dry Run)',
        '',
        '**No proposal was submitted**. This is a preview of what would be submitted.',
        '',
        '## Job',
        '',
        `**Job ID**: ${job_id}`,
        '',
        '## Proposal Details',
        '',
        `**Bid Amount**: $${bid_amount}`,
        `**Bid Type**: ${bid_type}`,
      ];

      if (estimated_duration) {
        lines.push(`**Estimated Duration**: ${estimated_duration}`);
      }

      lines.push('', '## Cover Letter', '', cover_letter);

      if (answers && answers.length > 0) {
        lines.push('', '## Screening Questions', '');
        for (const a of answers) {
          lines.push(`**Q**: ${a.question}`);
          lines.push(`**A**: ${a.answer}`);
          lines.push('');
        }
      }

      if (attachments && attachments.length > 0) {
        lines.push('', '## Attachments', '');
        for (const a of attachments) {
          lines.push(`- ${a}`);
        }
      }

      lines.push(
        '',
        '---',
        '',
        'To submit this proposal, remove the `dry_run` parameter and run again.',
        '',
        '**Warning**: Submitting a proposal will use Connects from your account.'
      );

      return {
        content: [{ type: 'text' as const, text: lines.join('\n') }],
      };
    }

    // Real submission
    const input: SubmitProposalInput = {
      jobId: job_id,
      coverLetter: cover_letter,
      bidAmount: bid_amount,
      bidType: bid_type.toUpperCase() as 'HOURLY' | 'FIXED',
    };

    if (estimated_duration) {
      input.estimatedDuration = estimated_duration;
    }
    if (answers) {
      input.answers = answers;
    }
    if (attachments) {
      input.attachments = attachments;
    }

    const data = await client.mutate<{
      submitProposal: SubmitProposalResponse;
    }>(SUBMIT_PROPOSAL, { input });

    const result = data.submitProposal;
    const lines: string[] = [
      '# Proposal Submitted Successfully!',
      '',
      `**Proposal ID**: ${result.proposal.id}`,
      `**Status**: ${result.proposal.status}`,
      '',
      `**Connects Used**: ${result.connectsUsed}`,
      `**Remaining Connects**: ${result.remainingConnects}`,
      '',
      'Your proposal has been submitted. The client will review it and may respond with questions or an interview request.',
      '',
      'Tips:',
      '- Check your messages regularly for client responses',
      '- Use get_proposal to track your proposal status',
      '- Be responsive to increase your chances of being hired',
    ];

    return {
      content: [{ type: 'text' as const, text: lines.join('\n') }],
    };
  } catch (error) {
    return formatMCPError(error);
  }
}

// ============================================================================
// Update Proposal Tool
// ============================================================================

export interface UpdateProposalArgs {
  proposal_id: string;
  cover_letter?: string;
  bid_amount?: number;
  estimated_duration?: string;
  dry_run?: boolean;
}

export async function updateProposal(client: UpworkGraphQLClient, args: UpdateProposalArgs) {
  const { proposal_id, cover_letter, bid_amount, estimated_duration, dry_run = false } = args;

  // Validation
  if (!cover_letter && !bid_amount && !estimated_duration) {
    return {
      content: [
        {
          type: 'text' as const,
          text: 'Error: At least one field (cover_letter, bid_amount, or estimated_duration) must be provided to update.',
        },
      ],
    };
  }

  if (cover_letter && cover_letter.length < 50) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error: Cover letter must be at least 50 characters. Current length: ${cover_letter.length}`,
        },
      ],
    };
  }

  if (cover_letter && cover_letter.length > 5000) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error: Cover letter cannot exceed 5000 characters. Current length: ${cover_letter.length}`,
        },
      ],
    };
  }

  if (bid_amount !== undefined && bid_amount <= 0) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error: Bid amount must be greater than 0. Current: ${bid_amount}`,
        },
      ],
    };
  }

  try {
    if (dry_run) {
      const lines: string[] = [
        '# Update Proposal Preview (Dry Run)',
        '',
        `**Proposal ID**: ${proposal_id}`,
        '',
        '**No changes were applied**. This is a preview of what would be updated.',
        '',
        '## Proposed Changes',
        '',
      ];

      if (cover_letter) {
        lines.push(`**Cover Letter**: (${cover_letter.length} characters)`);
        lines.push(
          '',
          cover_letter.substring(0, 200) + (cover_letter.length > 200 ? '...' : ''),
          ''
        );
      }

      if (bid_amount !== undefined) {
        lines.push(`**Bid Amount**: $${bid_amount}`);
      }

      if (estimated_duration) {
        lines.push(`**Estimated Duration**: ${estimated_duration}`);
      }

      lines.push(
        '',
        '---',
        '',
        'To apply these changes, remove the `dry_run` parameter and run again.',
        '',
        '**Note**: You can only update proposals that are still pending.'
      );

      return {
        content: [{ type: 'text' as const, text: lines.join('\n') }],
      };
    }

    const input: UpdateProposalInput = {};
    if (cover_letter) {
      input.coverLetter = cover_letter;
    }
    if (bid_amount !== undefined) {
      input.bidAmount = bid_amount;
    }
    if (estimated_duration) {
      input.estimatedDuration = estimated_duration;
    }

    const data = await client.mutate<{
      updateProposal: UpdateProposalResponse;
    }>(UPDATE_PROPOSAL, { id: proposal_id, input });

    const result = data.updateProposal;
    const lines: string[] = [
      '# Proposal Updated Successfully!',
      '',
      `**Proposal ID**: ${result.proposal.id}`,
      `**Status**: ${result.proposal.status}`,
    ];

    if (result.proposal.bidAmount !== undefined) {
      lines.push(`**Bid Amount**: $${result.proposal.bidAmount}`);
    }

    if (result.proposal.updatedAt) {
      lines.push(`**Updated**: ${new Date(result.proposal.updatedAt).toLocaleString()}`);
    }

    lines.push(
      '',
      'Your proposal has been updated. The client will see the new information when they review your proposal.'
    );

    return {
      content: [{ type: 'text' as const, text: lines.join('\n') }],
    };
  } catch (error) {
    return formatMCPError(error);
  }
}

// ============================================================================
// Withdraw Proposal Tool
// ============================================================================

export interface WithdrawProposalArgs {
  proposal_id: string;
  reason?: string;
  dry_run?: boolean;
}

export async function withdrawProposal(client: UpworkGraphQLClient, args: WithdrawProposalArgs) {
  const { proposal_id, reason, dry_run = false } = args;

  try {
    if (dry_run) {
      const lines: string[] = [
        '# Withdraw Proposal Preview (Dry Run)',
        '',
        `**Proposal ID**: ${proposal_id}`,
        '',
        '**No withdrawal was processed**. This is a preview of what would happen.',
        '',
      ];

      if (reason) {
        lines.push(`**Reason**: ${reason}`);
      }

      lines.push(
        '',
        '---',
        '',
        'To withdraw this proposal, remove the `dry_run` parameter and run again.',
        '',
        '## ⚠️ Warning',
        '',
        '- Withdrawn proposals **cannot be undone**',
        '- You would need to submit a new proposal to apply again',
        '- Some Connects may not be refunded',
        '- The client will not see your withdrawn proposal'
      );

      return {
        content: [{ type: 'text' as const, text: lines.join('\n') }],
      };
    }

    const data = await client.mutate<{
      withdrawProposal: WithdrawProposalResponse;
    }>(WITHDRAW_PROPOSAL, { id: proposal_id, reason });

    const result = data.withdrawProposal;
    const lines: string[] = [
      '# Proposal Withdrawn',
      '',
      `**Proposal ID**: ${result.proposal.id}`,
      `**New Status**: ${result.proposal.status}`,
      '',
      `**Connects Refunded**: ${result.connectsRefunded}`,
      '',
      'Your proposal has been withdrawn. The client will no longer see your application.',
      '',
      'If you want to apply to this job again, you will need to submit a new proposal.',
    ];

    return {
      content: [{ type: 'text' as const, text: lines.join('\n') }],
    };
  } catch (error) {
    return formatMCPError(error);
  }
}

// ============================================================================
// Get Proposal Stats Tool
// ============================================================================

export interface GetProposalStatsArgs {
  // No arguments needed - returns overall stats
}

export async function getProposalStats(client: UpworkGraphQLClient, _args: GetProposalStatsArgs) {
  try {
    const data = await client.query<{
      proposalStats: ProposalStats;
    }>(GET_PROPOSAL_STATS);

    const stats = data.proposalStats;
    const lines: string[] = [
      '# Proposal Statistics',
      '',
      '## Overview',
      '',
      `**Total Proposals**: ${stats.total}`,
      `**Pending**: ${stats.pending}`,
      `**Accepted**: ${stats.accepted}`,
      `**Declined**: ${stats.declined}`,
      `**Withdrawn**: ${stats.withdrawn}`,
      `**Archived**: ${stats.archived}`,
      '',
    ];

    if (stats.interviewRate !== undefined) {
      const interviewRate = (stats.interviewRate * 100).toFixed(1);
      lines.push(`**Interview Rate**: ${interviewRate}%`);
    }

    if (stats.hireRate !== undefined) {
      const hireRate = (stats.hireRate * 100).toFixed(1);
      lines.push(`**Hire Rate**: ${hireRate}%`);
    }

    if (stats.avgBidAmount !== undefined) {
      lines.push(`**Average Bid**: $${stats.avgBidAmount.toFixed(2)}`);
    }

    // Calculate acceptance rate
    if (stats.total > 0) {
      const acceptanceRate = ((stats.accepted / stats.total) * 100).toFixed(1);
      lines.push('', `**Overall Acceptance Rate**: ${acceptanceRate}%`);
    }

    return {
      content: [{ type: 'text' as const, text: lines.join('\n') }],
    };
  } catch (error) {
    return formatMCPError(error);
  }
}
