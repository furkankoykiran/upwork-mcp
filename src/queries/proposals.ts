/**
 * GraphQL queries and mutations for proposal operations
 */

/**
 * List proposals with optional status filter
 */
export const LIST_PROPOSALS = `
  query ListProposals($status: ProposalStatus, $limit: Int!, $offset: Int!) {
    proposals(status: $status, limit: $limit, offset: $offset) {
      totalCount
      edges {
        node {
          id
          job {
            id
            title
          }
          coverLetter
          bidAmount
          currency
          bidType
          estimatedDuration
          status
          createdAt
          questions {
            question
            answer
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

/**
 * Get detailed information about a specific proposal
 */
export const GET_PROPOSAL = `
  query GetProposal($id: ID!) {
    proposal(id: $id) {
      id
      job {
        id
        title
        description
        client {
          uid
          name
          country
        }
      }
      coverLetter
      bidAmount
      currency
      bidType
      estimatedDuration
      status
      createdAt
      updatedAt
      questions {
        question
        answer
      }
      attachments
      interviewRoom {
        id
        status
      }
    }
  }
`;

/**
 * Submit a new proposal for a job
 */
export const SUBMIT_PROPOSAL = `
  mutation SubmitProposal($input: SubmitProposalInput!) {
    submitProposal(input: $input) {
      proposal {
        id
        status
        job {
          id
          title
        }
      }
      connectsUsed
      remainingConnects
    }
  }
`;

/**
 * Update an existing proposal
 */
export const UPDATE_PROPOSAL = `
  mutation UpdateProposal($id: ID!, $input: UpdateProposalInput!) {
    updateProposal(id: $id, input: $input) {
      proposal {
        id
        status
        bidAmount
        coverLetter
        estimatedDuration
        updatedAt
      }
    }
  }
`;

/**
 * Withdraw a submitted proposal
 */
export const WITHDRAW_PROPOSAL = `
  mutation WithdrawProposal($id: ID!, $reason: String) {
    withdrawProposal(id: $id, reason: $reason) {
      success
      connectsRefunded
      proposal {
        id
        status
      }
    }
  }
`;

/**
 * Get proposal statistics
 */
export const GET_PROPOSAL_STATS = `
  query GetProposalStats {
    proposalStats {
      total
      pending
      accepted
      declined
      withdrawn
      archived
      interviewRate
      hireRate
      avgBidAmount
    }
  }
`;
