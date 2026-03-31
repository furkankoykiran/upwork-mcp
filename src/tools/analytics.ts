/**
 * Analytics and reporting MCP tools
 */

import { UpworkGraphQLClient } from '../client/graphql.js';
import { GET_TIME_REPORT } from '../queries/reports.js';

interface GetTimeReportArgs {
  contract_id?: string;
  limit?: number;
}

/**
 * Get time report
 */
export async function getTimeReport(client: UpworkGraphQLClient, args: GetTimeReportArgs) {
  const limit = args.limit || 50;

  // Build filter
  const filter: Record<string, unknown> = {};

  if (args.contract_id) {
    filter.contractIds = [parseInt(args.contract_id, 10)];
  }

  // Note: For simplicity, we're getting recent time entries
  // In a real implementation, you'd want to add date range filtering

  const data = await client.query<{ timeReport: any[] }>(GET_TIME_REPORT, {
    filter,
  });

  const entries = Array.isArray(data.timeReport) ? data.timeReport.slice(0, limit) : [];

  const formatted = formatTimeReport(entries);

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

function formatTimeReport(entries: any[]): string {
  if (entries.length === 0) {
    return 'No time entries found';
  }

  // Calculate totals
  let totalHours = 0;
  let totalCharge = 0;

  entries.forEach((entry) => {
    totalHours += entry.totalHoursWorked || 0;
    totalCharge += entry.totalCharges || 0;
  });

  let output = `# Time Report\n\n`;
  output += `**Total Entries**: ${entries.length}\n`;
  output += `**Total Hours**: ${totalHours.toFixed(2)}\n`;
  output += `**Total Charged**: ${totalCharge > 1000000 ? `${(totalCharge / 1000000).toFixed(2)}M` : `$${(totalCharge / 1000).toFixed(2)}K`}\n\n`;

  output += `---\n\n`;

  // Group by contract
  const byContract: Record<string, any[]> = {};

  entries.forEach((entry) => {
    const contractId = entry.contract?.id || 'unknown';
    if (!byContract[contractId]) {
      byContract[contractId] = [];
    }
    byContract[contractId].push(entry);
  });

  // Display entries by contract
  Object.entries(byContract).forEach(([contractId, contractEntries]) => {
    const firstEntry = contractEntries[0];
    const contractTitle = firstEntry.contract?.title || `Contract ${contractId}`;

    output += `## ${contractTitle}\n\n`;

    // Contract totals
    const contractHours = contractEntries.reduce((sum, e) => sum + (e.totalHoursWorked || 0), 0);
    const contractCharge = contractEntries.reduce((sum, e) => sum + (e.totalCharges || 0), 0);

    output += `*Hours: ${contractHours.toFixed(2)} | Charged: ${contractCharge > 1000000 ? `${(contractCharge / 1000000).toFixed(2)}M` : `$${(contractCharge / 1000).toFixed(2)}K`}*\n\n`;

    // Show recent entries (last 10)
    contractEntries.slice(0, 10).forEach((entry) => {
      output += formatTimeEntry(entry);
    });

    if (contractEntries.length > 10) {
      output += `_*... and ${contractEntries.length - 10} more entries_*\n\n`;
    }

    output += `\n`;
  });

  return output.trim();
}

function formatTimeEntry(entry: any): string {
  let output = `**${entry.dateWorkedOn ? new Date(entry.dateWorkedOn).toLocaleDateString() : 'N/A'}**`;

  if (entry.task) {
    output += ` - ${entry.task}`;
  }

  output += `\n`;
  output += `- Hours: ${entry.totalHoursWorked?.toFixed(2) || 'N/A'}`;

  if (entry.billRate) {
    output += ` @ ${entry.billRate.currency || '$'}${entry.billRate.amount || 'N/A'}/hr`;
  }

  output += `\n`;
  output += `- Charge: ${entry.totalCharges > 1000000 ? `${(entry.totalCharges / 1000000).toFixed(2)}M` : `$${(entry.totalCharges / 1000).toFixed(2)}K`}\n`;

  if (entry.memo) {
    output += `- Note: ${entry.memo}\n`;
  }

  output += '\n';
  return output;
}
