/**
 * GraphQL queries for contract operations
 */

export const LIST_CONTRACTS = `
  query ListContracts {
    contracts {
      edges {
        node {
          id
          title
          status
          deliveryModel
          kind
          isPtc
          createDate
          modifyDate
          startDate
          endDate
          offer {
            id
            title
            jobPostingId
          }
          job {
            id
            title
            jobType
          }
          freelancer {
            uid
            displayName
            email
          }
          clientOrganization {
            id
            name
          }
          hourlyLimits {
            limit
            period
            active
            notifyOnLimit
          }
          terms {
            contractType
            weeklyLimit
            hourlyRate
            currency
            fixedPriceAmount
            milestoneDescription
          }
          metadata {
            totalCharge
            totalHours
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

export const GET_CONTRACT_DETAILS = `
  query GetContractDetails($contractId: ID!) {
    contract(contractId: $contractId) {
      id
      title
      status
      deliveryModel
      kind
      isPtc
      createDate
      modifyDate
      startDate
      endDate
      offer {
        id
        title
        jobPostingId
      }
      job {
        id
        title
        jobType
      }
      freelancer {
        uid
        displayName
        email
      }
      clientOrganization {
        id
        name
      }
      hourlyLimits {
        limit
        period
        active
        notifyOnLimit
      }
      terms {
        contractType
        weeklyLimit
        hourlyRate
        currency
        fixedPriceAmount
        milestoneDescription
      }
      metadata {
        totalCharge
        totalHours
      }
    }
  }
`;
