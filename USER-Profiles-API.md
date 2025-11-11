# Wiki.js GraphQL API Documentation

## Team Members Query

Get all active users with complete profile data including portfolio, hire dates, roles, and job titles.

### Query

```graphql
query {
  users {
    teamMembers {
      id
      name
      email
      pictureUrl
      jobTitle
      location
      portfolio
      team
      birthday
      bio
      hireDate
      role
    }
  }
}
```

### Response

```json
{
  "data": {
    "users": {
      "teamMembers": [
        {
          "id": 3,
          "name": "Bryan Edman",
          "email": "bryane@ileadserve.com",
          "pictureUrl": "https://...",
          "jobTitle": "Developer",
          "location": "Utah",
          "portfolio": "iLeadServe",
          "team": null,
          "birthday": "1986-12-27",
          "bio": "Wiki.js administrator",
          "hireDate": "2025-06-03",
          "role": "Operations Manager"
        }
      ]
    }
  }
}
```

### Example Usage

```bash
curl -X POST https://wiki.ileadserve.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ users { teamMembers { id name email pictureUrl jobTitle location portfolio team hireDate role } } }"}'
```

### JavaScript/TypeScript

```javascript
const query = `
  query {
    users {
      teamMembers {
        id
        name
        email
        pictureUrl
        jobTitle
        location
        portfolio
        team
        birthday
        bio
        hireDate
        role
      }
    }
  }
`;

const response = await fetch("/graphql", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query }),
});

const result = await response.json();
const members = result.data.users.teamMembers;
```

## Update User Profile

Update extended profile data (portfolio, team, birthday, bio, hire date, role).

### Mutation

```graphql
mutation UpdateUserProfile(
  $userId: Int!
  $portfolio: String
  $team: String
  $birthday: Date
  $bio: String
  $hireDate: Date
  $role: String
) {
  customUserProfiles {
    update(
      userId: $userId
      portfolio: $portfolio
      team: $team
      birthday: $birthday
      bio: $bio
      hireDate: $hireDate
      role: $role
    ) {
      responseResult {
        succeeded
        message
      }
    }
  }
}
```

### Example

```bash
curl -X POST https://wiki.ileadserve.com/graphql \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { customUserProfiles { update(userId: 3, portfolio: \"iLeadServe\", team: null, hireDate: \"2025-06-03\", role: \"Operations Manager\") { responseResult { succeeded message } } } }"
  }'
```

### JavaScript/TypeScript

```javascript
const mutation = `
  mutation UpdateUserProfile($userId: Int!, $portfolio: String, $team: String, $birthday: Date, $bio: String, $hireDate: Date, $role: String) {
    customUserProfiles {
      update(
        userId: $userId
        portfolio: $portfolio
        team: $team
        birthday: $birthday
        bio: $bio
        hireDate: $hireDate
        role: $role
      ) {
        responseResult {
          succeeded
          message
        }
      }
    }
  }
`;

const variables = {
  userId: 3,
  portfolio: "iLeadServe",
  team: null,
  birthday: "1986-12-27",
  bio: "Wiki.js administrator",
  hireDate: "2025-06-03",
  role: "Operations Manager",
};

const response = await fetch("/graphql", {
  method: "POST",
  headers: {
    Authorization: "Bearer YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ query: mutation, variables }),
});
```

## Other User Queries

### Get Single User

```graphql
query {
  users {
    single(id: 3) {
      id
      name
      email
      pictureUrl
      jobTitle
      location
      extendedProfile {
        portfolio
        team
        birthday
        bio
        hireDate
        role
      }
    }
  }
}
```

### Search Users

```graphql
query {
  users {
    search(query: "bryan") {
      id
      name
      email
    }
  }
}
```

### List All Users (Basic)

```graphql
query {
  users {
    list {
      id
      name
      email
      pictureUrl
      isActive
      extendedProfile {
        portfolio
        team
        hireDate
        role
      }
    }
  }
}
```

## Field Types

| Field      | Type    | Description                                                                     |
| ---------- | ------- | ------------------------------------------------------------------------------- |
| id         | Int!    | User ID                                                                         |
| name       | String! | Full name                                                                       |
| email      | String! | Email address                                                                   |
| pictureUrl | String  | Profile picture URL                                                             |
| jobTitle   | String  | Job title (e.g., "Developer")                                                   |
| location   | String  | Location (e.g., "Utah")                                                         |
| portfolio  | String  | Portfolio abbreviation (e.g., "CCL", "PCL", "TFG", "iLeadServe")                |
| team       | String  | Team assignment with format "{PORTFOLIO} {LEAD}" (e.g., "CCL Rocio", "PCL Liz") |
| birthday   | Date    | Birthday (YYYY-MM-DD)                                                           |
| bio        | String  | Biography text                                                                  |
| hireDate   | Date    | Hire date (YYYY-MM-DD)                                                          |
| role       | String  | Role (e.g., "RM", "TL", "Operations Manager", "Admin", "Developer")             |

## Portfolio Structure

### Standard Data Format

**For RMs (Relationship Managers):**

- `portfolio`: Abbreviation (e.g., "TFG", "CCL", "PCL")
- `team`: Format "{PORTFOLIO} {TEAM_LEAD_FIRST_NAME}" (e.g., "TFG Nancy", "CCL Rocio", "PCL Liz")
- `role`: "RM"

**For TLs (Team Leaders):**

- `portfolio`: Abbreviation (e.g., "TFG", "CCL", "PCL")
- `team`: Format "{PORTFOLIO} {TL_FIRST_NAME}" (e.g., "TFG Berlyn", "CCL Cinthia", "PCL Meghann")
- `role`: "TL"

**For iLeadServe Staff:**

- `portfolio`: "iLeadServe"
- `team`: null or empty
- `role`: Job function (e.g., "Operations Manager", "Admin", "Developer", "Under Writing")

### Portfolio Abbreviations

- **TFG** = Titan Funding Group
- **CCL** = Community Credit Line
- **PCL** = Prime Credit Line
- **iLeadServe** = iLeadServe (no abbreviation)

### Team Structure

Teams are organized by portfolio and team lead:

```javascript
const PORTFOLIO_TEAMS = {
  iLeadServe: [],
  TFG: [
    "Nancy", // TFG Nancy
    "Berlyn", // TFG Berlyn
  ],
  CCL: [
    "Cinthia", // CCL Cinthia
    "Rocio", // CCL Rocio
  ],
  PCL: [
    "Liz", // PCL Liz
    "Meghann", // PCL Meghann
  ],
};

function getTeamsForPortfolio(portfolio) {
  const teamLeads = PORTFOLIO_TEAMS[portfolio] ?? [];
  return teamLeads.map((lead) => `${portfolio} ${lead}`);
}
```

### Data Quality Notes

**Current database may contain inconsistencies:**

- Some legacy records use full company names instead of abbreviations in the `team` field
- Some iLeadServe users have `team = "iLeadServe"` instead of `portfolio = "iLeadServe"`
- Empty portfolio or role fields for some users

**When querying data, handle these cases:**

```javascript
// Example: Normalizing team data
function normalizeTeam(user) {
  // Handle legacy full company names
  const fullNameMap = {
    "Titan Funding Group": "TFG",
    "Community Credit Line": "CCL",
    "Prime Credit Line": "PCL",
  };

  if (fullNameMap[user.team]) {
    return { portfolio: fullNameMap[user.team], team: null };
  }

  return { portfolio: user.portfolio, team: user.team };
}
```

## Authentication

Profile updates require API key authentication:

```bash
-H "Authorization: Bearer YOUR_API_KEY"
```

Reading team members does NOT require authentication.

## Server Locations

- **Production Wiki:** https://wiki.ileadserve.com/graphql
- **Test Wiki:** https://tlwiki.ileadserve.com/graphql

## Implementation Details

**Database:**

- Table: `user_profiles`
- Columns use snake_case: `user_id`, `hire_date`, etc.
- GraphQL resolvers map to camelCase: `userId`, `hireDate`, etc.

**Files:**

- Schema: `/var/www/wikijs/server/graph/schemas/user.graphql`
- Resolvers: `/var/www/wikijs/server/graph/resolvers/user.js`

**Key Resolver Logic:**

```javascript
// teamMembers resolver performs LEFT JOIN
async teamMembers() {
  const users = await WIKI.models.users.query()
    .leftJoin('user_profiles', 'users.id', 'user_profiles.user_id')
    .select(
      'users.id', 'users.name', 'users.email', 'users.pictureUrl',
      'users.jobTitle', 'users.location', 'users.isActive',
      'user_profiles.portfolio', 'user_profiles.team',
      'user_profiles.birthday', 'user_profiles.bio',
      'user_profiles.hire_date', 'user_profiles.role'
    )
    .where('users.isActive', true);

  return users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    pictureUrl: u.pictureUrl,
    jobTitle: u.jobTitle,
    location: u.location,
    isActive: u.isActive,
    portfolio: u.portfolio,
    team: u.team,
    birthday: u.birthday,
    bio: u.bio,
    hireDate: u.hire_date,  // Maps snake_case to camelCase
    role: u.role
  }));
}
```

## Schema Reference

```graphql
type CustomUserProfileMutation {
  update(
    userId: Int!
    portfolio: String
    team: String
    birthday: Date
    bio: String
    hireDate: Date
    role: String
  ): DefaultResponse
}

type ExtendedProfile {
  portfolio: String
  team: String
  birthday: Date
  bio: String
  hireDate: Date
  role: String
}

type TeamMember {
  id: Int!
  name: String!
  email: String!
  pictureUrl: String
  jobTitle: String
  location: String
  isActive: Boolean!
  portfolio: String
  team: String
  birthday: Date
  bio: String
  hireDate: Date
  role: String
}
```
