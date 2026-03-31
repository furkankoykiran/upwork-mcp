/**
 * GraphQL queries for job search operations
 */

export const SEARCH_JOBS = `
  query SearchJobs(
    $marketPlaceJobFilter: MarketplaceJobPostingsSearchFilter
    $searchType: MarketplaceJobPostingSearchType
    $sortAttributes: [MarketplaceJobPostingSearchSortAttribute]
  ) {
    marketplaceJobPostingsSearch(
      marketPlaceJobFilter: $marketPlaceJobFilter
      searchType: $searchType
      sortAttributes: $sortAttributes
    ) {
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
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_JOB_DETAILS = `
  query GetJobDetails($jobKey: String!) {
    jobPostingByJobKey(jobKey: $jobKey) {
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
        pastHires {
          uid
          displayName
        }
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
      screeningQuestions {
        question
      }
    }
  }
`;
