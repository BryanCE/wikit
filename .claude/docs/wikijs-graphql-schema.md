# Wiki.js GraphQL Schema Reference

This document provides the GraphQL schema definitions from the actual Wiki.js source code located at `/mnt/c/Users/bryan/Documents/wiki`.

## File Locations

**Primary Schema Files:**
- `/mnt/c/Users/bryan/Documents/wiki/server/graph/schemas/user.graphql` - User type definitions
- `/mnt/c/Users/bryan/Documents/wiki/server/graph/schemas/group.graphql` - Group type definitions
- `/mnt/c/Users/bryan/Documents/wiki/server/graph/schemas/common.graphql` - Common types
- `/mnt/c/Users/bryan/Documents/wiki/server/graph/schemas/scalars.graphql` - Custom scalars

## User Type Definitions

### Full User Type
**Requires:** "manage:users" or "manage:system" permission

```graphql
type User {
  id: Int!
  name: String!
  email: String!
  providerKey: String!
  providerName: String
  providerId: String
  providerIs2FACapable: Boolean
  isSystem: Boolean!
  isActive: Boolean!
  isVerified: Boolean!
  location: String!
  jobTitle: String!
  timezone: String!
  dateFormat: String!
  appearance: String!
  createdAt: Date!
  updatedAt: Date!
  lastLoginAt: Date
  tfaIsActive: Boolean!
  groups: [Group]!
}
```

### UserMinimal Type
Used in list and search operations:

```graphql
type UserMinimal {
  id: Int!
  name: String!
  email: String!
  providerKey: String!
  isSystem: Boolean!
  isActive: Boolean!
  createdAt: Date!
  lastLoginAt: Date
}
```

### UserProfile Type
Current user's profile:

```graphql
type UserProfile {
  id: Int!
  name: String!
  email: String!
  providerKey: String
  providerName: String
  isSystem: Boolean!
  isVerified: Boolean!
  location: String!
  jobTitle: String!
  timezone: String!
  dateFormat: String!
  appearance: String!
  createdAt: Date!
  updatedAt: Date!
  lastLoginAt: Date
  groups: [String]!
  pagesTotal: Int!
}
```

## User Query Operations

```graphql
type UserQuery {
  list(filter: String, orderBy: String): [UserMinimal]
  search(query: String!): [UserMinimal]
  single(id: Int!): User
  profile: UserProfile
  lastLogins: [UserLastLogin]
}
```

**Important:**
- `list` and `search` return `UserMinimal` (lightweight)
- `single(id)` returns full `User` type with all fields
- Use `single(id)` for each user when exporting to get complete data

## User Mutation Operations

```graphql
type UserMutation {
  create(
    email: String!
    name: String!
    passwordRaw: String
    providerKey: String!
    groups: [Int]!
    mustChangePassword: Boolean
    sendWelcomeEmail: Boolean
  ): UserResponse

  update(
    id: Int!
    email: String
    name: String
    newPassword: String
    groups: [Int]
    location: String
    jobTitle: String
    timezone: String
    dateFormat: String
    appearance: String
  ): DefaultResponse

  delete(id: Int!, replaceId: Int!): DefaultResponse
  verify(id: Int!): DefaultResponse
  activate(id: Int!): DefaultResponse
  deactivate(id: Int!): DefaultResponse
  enableTFA(id: Int!): DefaultResponse
  disableTFA(id: Int!): DefaultResponse
  resetPassword(id: Int!): DefaultResponse
}
```

## Export Strategy

To export full user data:

1. Query `users.list` to get all user IDs (returns UserMinimal)
2. For each user ID, query `users.single(id)` to get full User data
3. Export the complete User objects with all fields:
   - id, name, email
   - providerKey, providerName, providerId, providerIs2FACapable
   - isSystem, isActive, isVerified
   - location, jobTitle, timezone, dateFormat, appearance
   - createdAt, updatedAt, lastLoginAt
   - tfaIsActive
   - groups (array)

## Import Strategy

When importing users:

1. Use `users.create` mutation for new users
2. Use `users.update` mutation for existing users
3. Handle group assignments through groups array parameter
