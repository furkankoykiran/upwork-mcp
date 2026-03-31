/**
 * Contract-related MCP tools
 */

import { UpworkGraphQLClient } from '../client/graphql.js';
import { LIST_CONTRACTS, GET_CONTRACT_DETAILS } from '../queries/contracts.js';

/**
 * List contracts
 */
export async function listContracts(client: UpworkGraphQLClient) {
  const data = await client.query<{ contracts: any }>(LIST_CONTRACTS);

  const contracts = data.contracts?.edges?.map((edge: any) => edge.node) || [];

  const formatted = formatContractList(contracts);

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
 * Get contract details
 */
export async function getContractDetails(client: UpworkGraphQLClient, contractId: string) {
  const data = await client.query<{ contract: any }>(GET_CONTRACT_DETAILS, {
    contractId,
  });

  const contract = data.contract;

  if (!contract) {
    return {
      content: [
        {
          type: 'text',
          text: `Contract not found: ${contractId}`,
        },
      ],
    };
  }

  const formatted = formatContractDetails(contract);

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

function formatContractList(contracts: any[]): string {
  if (contracts.length === 0) {
    return 'No contracts found';
  }

  let output = `# Contracts (${contracts.length})\n\n`;

  // Group by status
  const activeContracts = contracts.filter((c) => c.status === 'active');
  const closedContracts = contracts.filter((c) => c.status !== 'active');

  if (activeContracts.length > 0) {
    output += `## Active Contracts (${activeContracts.length})\n\n`;
    activeContracts.forEach((contract) => {
      output += formatContractSummary(contract);
    });
  }

  if (closedContracts.length > 0) {
    output += `\n## Closed Contracts (${closedContracts.length})\n\n`;
    closedContracts.slice(0, 10).forEach((contract) => {
      output += formatContractSummary(contract);
    });

    if (closedContracts.length > 10) {
      output += `\n_*... and ${closedContracts.length - 10} more closed contracts_*\n`;
    }
  }

  return output.trim();
}

function formatContractSummary(contract: any): string {
  let output = `### ${contract.title || 'Untitled Contract'}\n\n`;
  output += `- **ID**: ${contract.id}\n`;
  output += `- **Status**: ${contract.status || 'N/A'}\n`;
  output += `- **Type**: ${contract.kind || 'N/A'}`;

  if (contract.terms) {
    if (contract.terms.contractType === 'hourly') {
      output += ` | **Rate**: ${contract.terms.currency || '$'}${contract.terms.hourlyRate || 'N/A'}/hr\n`;
      if (contract.terms.weeklyLimit) {
        output += `- **Weekly Limit**: ${contract.terms.weeklyLimit} hrs\n`;
      }
    } else {
      output += ` | **Amount**: ${contract.terms.currency || '$'}${contract.terms.fixedPriceAmount || 'N/A'}\n`;
    }
  }

  if (contract.metadata) {
    if (contract.metadata.totalHours) {
      output += `- **Hours Logged**: ${contract.metadata.totalHours}\n`;
    }
    if (contract.metadata.totalCharge) {
      output += `- **Total Charged**: ${contract.metadata.totalCharge > 1000000 ? `${(contract.metadata.totalCharge / 1000000).toFixed(2)}M` : `$${(contract.metadata.totalCharge / 1000).toFixed(2)}K`}\n`;
    }
  }

  if (contract.clientOrganization) {
    output += `- **Client**: ${contract.clientOrganization.name || 'N/A'}\n`;
  }

  if (contract.startDate) {
    output += `- **Started**: ${new Date(contract.startDate).toLocaleDateString()}\n`;
  }

  if (contract.endDate && contract.status !== 'active') {
    output += `- **Ended**: ${new Date(contract.endDate).toLocaleDateString()}\n`;
  }

  output += '\n';
  return output;
}

function formatContractDetails(contract: any): string {
  let output = `# ${contract.title || 'Contract Details'}\n\n`;

  output += `**Contract ID**: ${contract.id}\n`;
  output += `**Status**: ${contract.status || 'N/A'}\n`;
  output += `**Type**: ${contract.kind || 'N/A'}\n`;
  if (contract.deliveryModel) {
    output += `**Delivery Model**: ${contract.deliveryModel}\n`;
  }
  output += `**Is PTM**: ${contract.isPtm ? 'Yes' : 'No'}\n\n`;

  // Dates
  output += `## Dates\n`;
  output += `- **Created**: ${contract.createDate ? new Date(contract.createDate).toLocaleDateString() : 'N/A'}\n`;
  output += `- **Started**: ${contract.startDate ? new Date(contract.startDate).toLocaleDateString() : 'N/A'}\n`;
  if (contract.endDate) {
    output += `- **Ended**: ${new Date(contract.endDate).toLocaleDateString()}\n`;
  }
  output += `\n`;

  // Terms
  if (contract.terms) {
    output += `## Terms\n`;
    output += `- **Contract Type**: ${contract.terms.contractType || 'N/A'}\n`;

    if (contract.terms.contractType === 'hourly') {
      output += `- **Hourly Rate**: ${contract.terms.currency || '$'}${contract.terms.hourlyRate || 'N/A'}/hr\n`;
      if (contract.terms.weeklyLimit) {
        output += `- **Weekly Limit**: ${contract.terms.weeklyLimit} hrs/week\n`;
      }
    } else {
      output += `- **Fixed Price**: ${contract.terms.currency || '$'}${contract.terms.fixedPriceAmount || 'N/A'}\n`;
    }

    if (contract.terms.milestoneDescription) {
      output += `- **Milestone**: ${contract.terms.milestoneDescription}\n`;
    }

    output += `\n`;
  }

  // Hourly limits
  if (contract.hourlyLimits && contract.hourlyLimits.length > 0) {
    output += `## Hourly Limits\n`;
    contract.hourlyLimits.forEach((limit: any) => {
      output += `- **Period**: ${limit.period || 'N/A'}\n`;
      output += `  - Limit: ${limit.limit || 'N/A'} hrs\n`;
      output += `  - Active: ${limit.active ? 'Yes' : 'No'}\n`;
      output += `  - Notify: ${limit.notifyOnLimit ? 'Yes' : 'No'}\n`;
    });
    output += `\n`;
  }

  // Earnings
  if (contract.metadata) {
    output += `## Earnings\n`;
    if (contract.metadata.totalHours) {
      output += `- **Total Hours**: ${contract.metadata.totalHours}\n`;
    }
    if (contract.metadata.totalCharge) {
      const charge = contract.metadata.totalCharge;
      output += `- **Total Charged**: ${charge > 1000000 ? `${(charge / 1000000).toFixed(2)}M` : `$${(charge / 1000).toFixed(2)}K`}\n`;
    }
    output += `\n`;
  }

  // Parties
  if (contract.clientOrganization) {
    output += `## Client\n`;
    output += `- **Organization**: ${contract.clientOrganization.name || 'N/A'}\n`;
    if (contract.clientOrganization.id) {
      output += `- **ID**: ${contract.clientOrganization.id}\n`;
    }
    output += `\n`;
  }

  if (contract.freelancer) {
    output += `## Freelancer\n`;
    output += `- **Name**: ${contract.freelancer.displayName || 'N/A'}\n`;
    if (contract.freelancer.uid) {
      output += `- **UID**: ${contract.freelancer.uid}\n`;
    }
    output += `\n`;
  }

  // Job/Offer
  if (contract.job) {
    output += `## Associated Job\n`;
    output += `- **Job ID**: ${contract.job.id}\n`;
    output += `- **Title**: ${contract.job.title || 'N/A'}\n`;
    output += `- **Type**: ${contract.job.jobType || 'N/A'}\n`;
    output += `\n`;
  }

  if (contract.offer) {
    output += `## Offer\n`;
    output += `- **Offer ID**: ${contract.offer.id}\n`;
    output += `- **Title**: ${contract.offer.title || 'N/A'}\n`;
    if (contract.offer.jobPostingId) {
      output += `- **Job Posting ID**: ${contract.offer.jobPostingId}\n`;
    }
    output += `\n`;
  }

  return output.trim();
}
