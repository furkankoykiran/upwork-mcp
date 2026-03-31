/**
 * Profile-related MCP tools
 */

import { UpworkGraphQLClient } from '../client/graphql.js';
import { GET_MY_PROFILE, GET_CONNECTS_BALANCE } from '../queries/profile.js';
import type { TalentProfile } from '../types/api.js';

/**
 * Get freelancer profile
 */
export async function getProfile(client: UpworkGraphQLClient) {
  const data = await client.query<{ me: any }>(GET_MY_PROFILE);

  if (!data.me?.profile) {
    return {
      content: [
        {
          type: 'text',
          text: 'No profile data found',
        },
      ],
    };
  }

  const profile = data.me.profile;
  const formatted = formatProfile(profile);

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
 * Get profile completeness
 */
export async function getProfileCompleteness(client: UpworkGraphQLClient) {
  const data = await client.query<{ me: any }>(GET_MY_PROFILE);

  if (!data.me?.profile) {
    return {
      content: [
        {
          type: 'text',
          text: 'No profile data found',
        },
      ],
    };
  }

  const completeness = data.me.profile.profileCompleteness;
  const formatted = formatProfileCompleteness(completeness);

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
 * Get profile skills
 */
export async function getSkills(client: UpworkGraphQLClient) {
  const data = await client.query<{ me: any }>(GET_MY_PROFILE);

  if (!data.me?.profile) {
    return {
      content: [
        {
          type: 'text',
          text: 'No profile data found',
        },
      ],
    };
  }

  const skills = data.me.profile.skills || [];
  const formatted = formatSkills(skills);

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
 * Get connects balance
 */
export async function getConnectsBalance(client: UpworkGraphQLClient) {
  const data = await client.query<{ me: any }>(GET_CONNECTS_BALANCE);

  if (!data.me?.profile) {
    return {
      content: [
        {
          type: 'text',
          text: 'No profile data found',
        },
      ],
    };
  }

  const connects = data.me.profile.connects;
  const formatted = formatConnects(connects);

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

function formatProfile(profile: any): string {
  const identity = profile.identity || {};
  const personalData = profile.personalData || {};
  const availability = profile.personAvailability || {};
  const aggregates = profile.profileAggregates || {};

  return `
# Upwork Profile

## Basic Information
- **Name**: ${identity.displayName || 'N/A'}
- **Headline**: ${personalData.headline || 'N/A'}
- **Location**: ${personalData.city ? `${personalData.city}, ${personalData.country || ''}`.trim() : personalData.country || 'N/A'}
- **Hourly Rate**: ${personalData.hourlyRate ? `${personalData.currency || '$'}${personalData.hourlyRate}/hr` : 'N/A'}

## Availability
- **Status**: ${availability.status || 'N/A'}
- **Hours/Week**: ${availability.hoursPerWeek || 'N/A'}

## Overview
${personalData.overview || 'No overview provided'}

## Stats
- **Total Jobs**: ${aggregates.totalJobs || 0}
- **Total Hours**: ${aggregates.totalHours || 0}
- **Total Earnings**: ${aggregates.totalEarnings ? `${(aggregates.totalEarnings / 1000000).toFixed(2)}M` : '$0'}
- **Job Success Score**: ${aggregates.rating || 'N/A'}
`.trim();
}

function formatProfileCompleteness(completeness: any): string {
  const pct = completeness?.profileCompletenessPct || 0;
  const required = completeness?.requiredFields || [];
  const recommended = completeness?.recommendedFields || [];

  let output = `# Profile Completeness: ${pct}%\n\n`;

  if (required.length > 0) {
    output += '## Required Fields\n';
    required.forEach((field: any) => {
      const status = field.completed ? '✅' : '❌';
      output += `- ${status} ${field.name}\n`;
    });
    output += '\n';
  }

  if (recommended.length > 0) {
    output += '## Recommended Fields\n';
    recommended.forEach((field: any) => {
      const status = field.completed ? '✅' : '💡';
      output += `- ${status} ${field.name}\n`;
    });
  }

  return output.trim();
}

function formatSkills(skills: any[]): string {
  if (skills.length === 0) {
    return 'No skills listed on profile';
  }

  let output = '# Profile Skills\n\n';

  skills.forEach((skill, index) => {
    output += `${index + 1}. ${skill.name}${skill.proficiency ? ` (${skill.proficiency})` : ''}\n`;
  });

  return output.trim();
}

function formatConnects(connects: any): string {
  const total = connects?.total || 0;
  const canPurchase = connects?.canPurchase || false;

  return `
# Connects Balance

**Available Connects**: ${total}

${canPurchase ? '\nYou can purchase additional connects.\n' : '\nConnects cannot be purchased at this time.\n'}
`.trim();
}
