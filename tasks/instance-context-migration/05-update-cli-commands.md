# Task 5: Update CLI Commands

## Objective
Update CLI commands to set instance in context before calling API functions, and remove instance arguments from API calls.

## Files to Modify
- `src/commands/pages.ts`
- `src/commands/navigation.ts`
- `src/commands/users.ts`
- `src/commands/groups.ts`
- `src/commands/sync.ts`
- `src/commands/status.ts`
- `src/commands/deletePages.ts`
- `src/commands/listPages.ts`
- `src/commands/compare.ts`
- `src/commands/compareExports.ts`
- `src/commands/analyze.ts`
- `src/commands/config.ts`

## Pattern to Follow

### Before
```typescript
export async function listPagesCommand(instance: string, options: any) {
  const pages = await listPages(instance, options);
  // ... process pages
}
```

### After
```typescript
import { InstanceContext } from "@/contexts/InstanceContext";

export async function listPagesCommand(instance: string, options: any) {
  // Set instance in context at the start
  InstanceContext.setInstance(instance);

  // Now API calls don't need instance parameter
  const pages = await listPages(options);
  // ... process pages
}
```

## Steps for Each File

1. Add import: `import { InstanceContext } from "@/contexts/InstanceContext";`
2. At the start of each command function, add: `InstanceContext.setInstance(instance);`
3. Remove `instance` argument from all API function calls
4. Keep the `instance` parameter in the command function signature (CLI still passes it)

## Checklist

### src/commands/pages.ts
- [ ] Add InstanceContext import
- [ ] Set instance at start of functions
- [ ] Remove instance from API calls

### src/commands/navigation.ts
- [ ] Add InstanceContext import
- [ ] Set instance at start of functions
- [ ] Remove instance from API calls

### src/commands/users.ts
- [ ] Add InstanceContext import
- [ ] Set instance at start of functions
- [ ] Remove instance from API calls

### src/commands/groups.ts
- [ ] Add InstanceContext import
- [ ] Set instance at start of functions
- [ ] Remove instance from API calls

### src/commands/sync.ts
- [ ] Add InstanceContext import
- [ ] Set instance at start of functions
- [ ] Remove instance from API calls

### src/commands/status.ts
- [ ] Add InstanceContext import
- [ ] Set instance at start of functions
- [ ] Remove instance from API calls

### src/commands/deletePages.ts
- [ ] Add InstanceContext import
- [ ] Set instance at start of functions
- [ ] Remove instance from API calls

### src/commands/listPages.ts
- [ ] Add InstanceContext import
- [ ] Set instance at start of functions
- [ ] Remove instance from API calls

### src/commands/compare.ts
- [ ] Add InstanceContext import
- [ ] Set instance at start of functions
- [ ] Remove instance from API calls

### src/commands/compareExports.ts
- [ ] Add InstanceContext import
- [ ] Set instance at start of functions
- [ ] Remove instance from API calls

### src/commands/analyze.ts
- [ ] Add InstanceContext import
- [ ] Set instance at start of functions
- [ ] Remove instance from API calls

### src/commands/config.ts
- [ ] Add InstanceContext import
- [ ] Set instance at start of functions (if applicable)
- [ ] Remove instance from API calls (if applicable)

## Verification

```bash
# Should compile without errors
bun run typecheck

# Test a CLI command
bun run dev list

# Test with specific instance
bun run dev list -i rmwiki
```

## Notes

- Command functions still receive `instance` parameter from CLI argument parser
- We set it in the context, then API calls use it automatically
- This maintains backward compatibility with existing CLI interface

## Next Task
`06-update-interface-components.md`
