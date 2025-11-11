# Task 2: Update Core graphql() Function

## Objective
Update the main `graphql()` function in `src/api.ts` to use InstanceContext instead of instance parameter.

## Files to Modify
- `src/api.ts`

## Changes Required

### 1. Add Import
```typescript
import { InstanceContext } from "@/contexts/InstanceContext";
```

### 2. Update Function Signature

**Before**:
```typescript
export async function graphql<TData, TVars = Record<string, unknown>>(
  instance: string,
  query: string,
  variables?: TVars
): Promise<TData>
```

**After**:
```typescript
export async function graphql<TData, TVars = Record<string, unknown>>(
  query: string,
  variables?: TVars
): Promise<TData>
```

### 3. Get Instance from Context

Add at the start of the function:
```typescript
const instance = InstanceContext.getInstance();
const queryPreview = query.trim().split('\n')[0]?.slice(0, 100) ?? "";
logger.info({ instance, queryPreview, variables }, "GraphQL request starting");

const config = await getDynamicConfig(instance);
```

### 4. Update Internal Calls

Update all calls to `graphql()` within `src/api.ts` to remove the instance argument:

**Before**:
```typescript
const data = await graphql<{ pages: { links: PageLinkItem[] } }>(instance, query, {});
```

**After**:
```typescript
const data = await graphql<{ pages: { links: PageLinkItem[] } }>(query, {});
```

## Checklist

- [x] Add import for InstanceContext
- [x] Remove `instance` parameter from function signature
- [x] Add `const instance = InstanceContext.getInstance()` at start
- [x] Update all internal `graphql()` calls in the same file
- [x] Verify logging includes instance info
- [x] TypeScript compiles without errors

## Functions in src/api.ts to Update

Check and update calls in:
- `getPageLinks()`
- `getAllPages()`
- Any other functions that call `graphql()`

## Verification

```bash
# Should compile without errors
bun run typecheck

# Check for any remaining old-style calls
grep "graphql<.*>(instance," src/api.ts
# Should return no results
```

## Next Task
`03-update-api-modules.md`
