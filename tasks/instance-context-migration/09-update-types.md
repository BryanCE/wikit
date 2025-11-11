# Task 9: Update Type Definitions

## Objective
Clean up type definitions to remove `instance: string` fields that are no longer needed.

## Files to Review
- `src/types/user/userTypes.ts`
- `src/types/group/groupTypes.ts`
- `src/types/page/pageTypes.ts`
- `src/types/navigation/navigationTypes.ts`
- `src/types/status/statusTypes.ts`
- `src/types/sync/syncTypes.ts`
- `src/types/command/commandTypes.ts`
- `src/types/compare/compareTypes.ts`
- `src/types/analysis/analysisTypes.ts`
- `src/types/config/configTypes.ts`

## What to Look For

### Remove instance from function option types

**Before**:
```typescript
export interface UserListOptions {
  instance: string;
  filter?: string;
  orderBy?: string;
}
```

**After**:
```typescript
export interface UserListOptions {
  filter?: string;
  orderBy?: string;
}
```

### Keep instance where it makes sense

Some types may legitimately need instance field:
- Config-related types
- Command option types (CLI still receives instance)
- Response types that include instance info

**Example - Keep**:
```typescript
export interface ConfigInstance {
  name: string;
  url: string;
  key: string;
}
```

## Strategy

1. Review each type file
2. Identify types used for API function parameters
3. Remove instance field from these types
4. Keep instance where it's part of the data structure
5. Verify TypeScript compiles

## Checklist

### src/types/user/userTypes.ts
- [ ] Review all interfaces
- [ ] Remove instance from option types
- [ ] Keep instance in types that truly need it
- [ ] Verify TypeScript compiles

### src/types/group/groupTypes.ts
- [ ] Review all interfaces
- [ ] Remove instance from option types
- [ ] Keep instance in types that truly need it
- [ ] Verify TypeScript compiles

### src/types/page/pageTypes.ts
- [ ] Review all interfaces
- [ ] Remove instance from option types
- [ ] Keep instance in types that truly need it
- [ ] Verify TypeScript compiles

### src/types/navigation/navigationTypes.ts
- [ ] Review all interfaces
- [ ] Remove instance from option types
- [ ] Keep instance in types that truly need it
- [ ] Verify TypeScript compiles

### src/types/status/statusTypes.ts
- [ ] Review all interfaces
- [ ] Remove instance from option types
- [ ] Keep instance in types that truly need it
- [ ] Verify TypeScript compiles

### src/types/sync/syncTypes.ts
- [ ] Review all interfaces
- [ ] Remove instance from option types
- [ ] Keep instance in types that truly need it
- [ ] Verify TypeScript compiles

### src/types/command/commandTypes.ts
- [ ] Review all interfaces
- [ ] Remove instance from option types (may need to keep for CLI)
- [ ] Verify TypeScript compiles

### src/types/compare/compareTypes.ts
- [ ] Review all interfaces
- [ ] Remove instance from option types
- [ ] Verify TypeScript compiles

### src/types/analysis/analysisTypes.ts
- [ ] Review all interfaces
- [ ] Remove instance from option types
- [ ] Verify TypeScript compiles

### src/types/config/configTypes.ts
- [ ] Review all interfaces
- [ ] Likely keep instance fields (config-related)
- [ ] Verify TypeScript compiles

## Verification

```bash
# Should compile without errors
bun run typecheck

# Search for instance fields in types
grep -n "instance:" src/types/**/*.ts

# Review the results - some are legitimate, some can be removed
```

## Notes

- Be conservative - when in doubt, keep the field
- Focus on removing instance from function option types
- Config and command types may legitimately need instance
- This is mostly cleanup - the functionality already works

## Next Task
`10-final-verification.md`
