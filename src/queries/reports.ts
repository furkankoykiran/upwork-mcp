/**
 * GraphQL queries for time and earnings reports
 */

export const GET_TIME_REPORT = `
  query GetTimeReport($filter: TimeReportFilter) {
    timeReport(filter: $filter) {
      dateWorkedOn
      weekWorkedOn
      monthWorkedOn
      yearWorkedOn
      freelancer {
        uid
        displayName
        email
      }
      team {
        id
        name
      }
      contract {
        id
        title
        status
      }
      termId
      task
      taskDescription
      memo
      totalHoursWorked
      totalCharges
      totalOnlineHoursWorked
      totalOnlineCharge
      totalOfflineHoursWorked
      totalOfflineCharge
      billRate {
        amount
        currency
      }
    }
  }
`;

export const GET_CONTRACT_TIME_REPORT = `
  query GetContractTimeReport(
    $filter: TimeReportFilter
    $pagination: Pagination
  ) {
    contractTimeReport(filter: $filter, pagination: $pagination) {
      totalCount
      edges {
        node {
          dateWorkedOn
          weekWorkedOn
          monthWorkedOn
          yearWorkedOn
          freelancer {
            uid
            displayName
          }
          contract {
            id
            title
            status
          }
          termId
          task
          taskDescription
          memo
          totalHoursWorked
          totalCharges
          totalOnlineHoursWorked
          totalOnlineCharge
          totalOfflineHoursWorked
          totalOfflineCharge
          billRate {
            amount
            currency
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
