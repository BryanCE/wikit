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
- [ ] `listUsers()` - remove instance param
- [ ] `searchUsers()` - remove instance param
- [ ] `getUser()` - remove instance param
- [ ] `createUser()` - remove instance param
- [ ] `updateUser()` - remove instance param
- [ ] `deleteUser()` - remove instance param
- [ ] `getUsersLastLogin()` - remove instance param
- [ ] Any other functions

### src/api/groups.ts
- [ ] `listGroups()` - remove instance param
- [ ] `getGroup()` - remove instance param
- [ ] `createGroup()` - remove instance param
- [ ] `updateGroup()` - remove instance param
- [ ] `deleteGroup()` - remove instance param
- [ ] `assignUser()` - remove instance param
- [ ] `unassignUser()` - remove instance param
- [ ] Any other functions

### src/api/pages.ts
- [ ] `listPages()` - remove instance param
- [ ] `getPage()` - remove instance param
- [ ] `createPage()` - remove instance param
- [ ] `updatePage()` - remove instance param
- [ ] `deletePage()` - remove instance param
- [ ] `movePage()` - remove instance param
- [ ] `convertPage()` - remove instance param
- [ ] Any other functions

### src/api/navigation.ts
- [ ] `getNavigationTree()` - remove instance param
- [ ] `updateNavigationTree()` - remove instance param
- [ ] `createNavigationItem()` - remove instance param
- [ ] `updateNavigationItem()` - remove instance param
- [ ] `deleteNavigationItem()` - remove instance param
- [ ] Any other functions

### src/api/sync.ts
- [ ] `syncPages()` - remove instance param
- [ ] `syncUsers()` - remove instance param
- [ ] Any other functions

### src/api/config.ts
- [ ] Any functions that use instance parameter

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
