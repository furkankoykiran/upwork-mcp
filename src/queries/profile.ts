/**
 * GraphQL queries for profile-related operations
 */

export const GET_TALENT_PROFILE = `
  query GetTalentProfile($profileKey: String!) {
    talentProfileByProfileKey(profileKey: $profileKey) {
      personId
      identity {
        firstName
        lastName
        displayName
        email
      }
      personalData {
        headline
        overview
        hourlyRate
        currency
        country
        city
        timeZone
      }
      personAvailability {
        status
        hoursPerWeek
        availability
      }
      profileCompleteness {
        profileCompletenessPct
        requiredFields {
          name
          completed
        }
        recommendedFields {
          name
          completed
        }
      }
      skills {
        name
        proficiency
      }
      jobCategories {
        name
        subCategories
      }
      profileAggregates {
        totalJobs
        totalHours
        totalEarnings
        rating
      }
    }
  }
`;

export const GET_MY_PROFILE = `
  query GetMyProfile {
    me {
      uid
      displayName
      email
      profile {
        ... on TalentProfile {
          personId
          identity {
            firstName
            lastName
            displayName
          }
          personalData {
            headline
            overview
            hourlyRate
            currency
          }
          personAvailability {
            status
            hoursPerWeek
          }
          profileCompleteness {
            profileCompletenessPct
          }
          skills {
            name
          }
          profileAggregates {
            totalJobs
            totalHours
            totalEarnings
            rating
          }
        }
      }
    }
  }
`;

export const GET_CONNECTS_BALANCE = `
  query GetConnectsBalance {
    me {
      uid
      profile {
        ... on TalentProfile {
          connects {
            total
            canPurchase
          }
        }
      }
    }
  }
`;
