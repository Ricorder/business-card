import { gql } from './gql.js'

export const CARD_QUERY = gql`
  query Card {
    card {
      profile {
        id
        handle
        displayName
        title
        tagline
        location
        summary
        timezone
        updatedAt
      }
      metrics {
        id
        value
        label
        detail
        position
      }
      experiences {
        id
        slug
        company
        companyNote
        role
        period
        dateStart
        dateEnd
        isCurrent
        location
        summary
        achievementsTotal
        achievements {
          id
          text
          category
          position
        }
      }
      skillGroups {
        id
        slug
        name
        position
        skills {
          id
          name
          note
          featured
          position
        }
      }
      links {
        id
        kind
        label
        url
        position
      }
      languages {
        id
        name
        level
        position
      }
    }
  }
`

export const RESUME_QUERY = gql`
  query Resume {
    resume {
      profile {
        id
        handle
        displayName
        title
        tagline
        location
        summary
        timezone
        updatedAt
      }
      metrics {
        id
        value
        label
        detail
        position
      }
      experiences {
        id
        slug
        company
        companyNote
        role
        period
        dateStart
        dateEnd
        isCurrent
        location
        summary
        achievementsTotal
        achievements {
          id
          text
          category
          position
        }
      }
      projects {
        id
        slug
        name
        summary
        year
        url
        position
        stack
      }
      skillGroups {
        id
        slug
        name
        position
        skills {
          id
          name
          note
          featured
          position
        }
      }
      languages {
        id
        name
        level
        position
      }
      education {
        id
        school
        year
        degree
        note
        position
      }
      links {
        id
        kind
        label
        url
        position
      }
    }
  }
`

export const SEARCH_QUERY = gql`
  query Search($query: String!, $limit: Int) {
    search(query: $query, limit: $limit) {
      query
      total
      hits {
        id
        kind
        title
        text
        company
      }
    }
  }
`

export const HEALTH_QUERY = gql`
  query Health {
    health {
      status
      version
      uptimeSeconds
      databaseConnected
      records
    }
  }
`

export const OPERATIONDocumentMap = {
  card: CARD_QUERY,
  resume: RESUME_QUERY,
  search: SEARCH_QUERY,
  health: HEALTH_QUERY,
} as const
