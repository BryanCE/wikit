# Task 3: Update All API Modules

## Objective
Remove `instance` parameter from all exported functions in API modules since `graphql()` now handles it internally.

## Files to Modify
- `src/api/users.ts`
- `src/api/groups.ts`
- `src/api/pages.ts`
- `src/api/navigation.ts`
- `src/api/sync.ts`
- `src/api/config.ts`

## Pattern to Follow

### Before
```typescript
export async function listUsers(
  instance: string,
  options: UserListOptions
): Promise<UserMinimal[]> {
  const result = await graphql<{ users: { list: UserMinimal[] } }>(
    instance,
    query,
    { filter: options.filter, orderBy: options.orderBy }
  );
  return result.users.list;
}
```

### After
```typescript
export async function listUsers(
  options: UserListOptions
): Promise<UserMinimal[]> {
  const result = await graphql<{ users: { list: UserMinimal[] } }>(
    query,
    { filter: options.filter, orderBy: options.orderBy }
  );
  return result.users.list;
}
```

## Steps for Each File

1. Open the file
2. For each exported function:
   - Remove `instance: string` from parameters
   - Remove `instance` argument from `graphql()` calls
   - Update function signature
3. Save and verify TypeScript compiles

## Checklist

### src/api/users.ts
- [x] `listUsers()` - remove instance param
- [x] `searchUsers()` - remove instance param
- [x] `getUser()` - remove instance param
- [x] `createUser()` - remove instance param
- [x] `updateUser()` - remove instance param
- [x] `deleteUser()` - remove instance param
- [x] `getUsersLastLogin()` - remove instance param
- [x] Any other functions

### src/api/groups.ts
- [x] `listGroups()` - remove instance param
- [x] `getGroup()` - remove instance param
- [x] `createGroup()` - remove instance param
- [x] `updateGroup()` - remove instance param
- [x] `deleteGroup()` - remove instance param
- [x] `assignUser()` - remove instance param
- [x] `unassignUser()` - remove instance param
- [x] Any other functions

### src/api/pages.ts
- [x] `listPages()` - remove instance param
- [x] `getPage()` - remove instance param
- [x] `createPage()` - remove instance param
- [x] `updatePage()` - remove instance param
- [x] `deletePage()` - remove instance param
- [x] `movePage()` - remove instance param
- [x] `convertPage()` - remove instance param
- [x] Any other functions

### src/api/navigation.ts
- [x] `getNavigationTree()` - remove instance param
- [x] `updateNavigationTree()` - remove instance param
- [x] `createNavigationItem()` - remove instance param
- [x] `updateNavigationItem()` - remove instance param
- [x] `deleteNavigationItem()` - remove instance param
- [x] Any other functions

### src/api/sync.ts
- [x] `syncPages()` - remove instance param
- [x] `syncUsers()` - remove instance param
- [x] Any other functions

### src/api/config.ts
- [x] Any functions that use instance parameter

## Verification

```bash
# Should compile without errors
bun run typecheck

# Search for remaining instance parameters in API files
grep -n "instance: string" src/api/*.ts
# Should only show type definitions, not function parameters

# Search for old-style graphql calls
grep "graphql<.*>(instance," src/api/*.ts
# Should return no results
```

## Next Task
`04-update-app-content.md`
