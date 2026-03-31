/**
 * GraphQL queries and mutations for saved jobs operations
 */

/**
 * List saved jobs
 */
export const LIST_SAVED_JOBS = `
  query ListSavedJobs($limit: Int!, $offset: Int!) {
    savedJobs(limit: $limit, offset: $offset) {
      totalCount
      edges {
        node {
          id
          title
          description
          jobStatus
          jobType
          workload
          duration
          entryLevel
          url
          createdDate
          lastUpdatedDate
          client {
            uid
            name
            country
            paymentVerificationStatus
            totalSpent
            totalHires
            totalReviews
            rating
            jobsPosted
          }
          budget {
            amount
            currency
            type
            min
            max
          }
          skills
          category {
            name
            subCategories {
              name
            }
          }
          connects
          savedDate
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
 * Save or unsave a job
 */
export const SAVE_JOB = `
  mutation SaveJob($jobId: ID!, $save: Boolean!) {
    saveJob(jobId: $jobId, save: $save) {
      success
      job {
        id
        title
        isSaved
      }
    }
  }
`;

/**
 * Get job recommendations based on profile
 */
export const GET_JOB_RECOMMENDATIONS = `
  query GetJobRecommendations($limit: Int!) {
    jobRecommendations(limit: $limit) {
      edges {
        node {
          id
          title
          description
          jobStatus
          jobType
          workload
          duration
          entryLevel
          url
          createdDate
          client {
            uid
            name
            country
            paymentVerificationStatus
            totalSpent
            totalHires
            totalReviews
            rating
            jobsPosted
          }
          budget {
            amount
            currency
            type
            min
            max
          }
          skills
          category {
            name
            subCategories {
              name
            }
          }
          connects
          matchScore
          matchReasons
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
