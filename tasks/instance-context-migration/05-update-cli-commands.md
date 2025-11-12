# Task 5: Update CLI Commands

## Objective
Remove instance parameter from CLI command functions since InstanceContext is now set globally via preAction hook.

## Files Modified
- `src/index.ts` - Added preAction hook
- `src/commands/pages.ts`
- `src/commands/navigation.ts`
- `src/commands/users.ts`
- `src/commands/groups.ts`
- `src/commands/deletePages.ts`
- `src/commands/listPages.ts`
- `src/cli/pages.ts`
- `src/cli/navigation.ts`
- `src/cli/users.ts`
- `src/cli/groups.ts`

Note: `sync.ts`, `status.ts`, and `compare.ts` retain InstanceContext because they switch instances internally.

## New Pattern: PreAction Hook

### src/index.ts
```typescript
import { InstanceContext } from "@/contexts/InstanceContext";

program.hook("preAction", (thisCommand, actionCommand) => {
  const globalOptions = program.opts<GlobalOptions>();
  InstanceContext.setInstance(globalOptions.instance ?? null);
});
```

This hook runs ONCE before any command, eliminating the need to:
1. Get global options in every CLI action
2. Pass instance to every command function
3. Set instance in every command function

## Pattern for Command Functions

### Before
```typescript
import { InstanceContext } from "@/contexts/InstanceContext";

export async function listUsersCommand(
  options: { filter?: string } & UserCommandOptions
): Promise<void> {
  InstanceContext.setInstance(options.instance ?? "");
  const users = await userApi.listUsers({ filter: options.filter });
}
```

### After
```typescript
export async function listUsersCommand(
  options: { filter?: string }
): Promise<void> {
  // Instance already set by preAction hook
  const users = await userApi.listUsers({ filter: options.filter });
}
```

## Pattern for CLI Registration

### Before
```typescript
usersCommand
  .command("list")
  .action(async (options: { filter?: string }) => {
    const globalOptions = program.opts<GlobalOptions>();
    await listUsersCommand({ ...options, instance: globalOptions.instance });
  });
```

### After
```typescript
usersCommand
  .command("list")
  .action(async (options: { filter?: string }) => {
    await listUsersCommand(options);
  });
```

## Checklist

### src/commands/pages.ts
- [x] Add InstanceContext import
- [x] Set instance at start of functions
- [x] Remove instance from API calls

### src/commands/navigation.ts
- [x] Add InstanceContext import
- [x] Set instance at start of functions
- [x] Remove instance from API calls

### src/commands/users.ts
- [x] Add InstanceContext import
- [x] Set instance at start of functions
- [x] Remove instance from API calls

### src/commands/groups.ts
- [x] Add InstanceContext import
- [x] Set instance at start of functions
- [x] Remove instance from API calls

### src/commands/sync.ts
- [x] Add InstanceContext import
- [x] Set instance at start of functions
- [x] Remove instance from API calls

### src/commands/status.ts
- [x] Add InstanceContext import
- [x] Set instance at start of functions
- [x] Remove instance from API calls

### src/commands/deletePages.ts
- [x] Add InstanceContext import
- [x] Set instance at start of functions
- [x] Remove instance from API calls

### src/commands/listPages.ts
- [x] Add InstanceContext import
- [x] Set instance at start of functions
- [x] Remove instance from API calls

### src/commands/compare.ts
- [x] Add InstanceContext import
- [x] Set instance at start of functions
- [x] Remove instance from API calls

### src/commands/compareExports.ts
- [x] Add InstanceContext import
- [x] Set instance at start of functions
- [x] Remove instance from API calls

### src/commands/analyze.ts
- [x] Add InstanceContext import
- [x] Set instance at start of functions
- [x] Remove instance from API calls

### src/commands/config.ts
- [x] Add InstanceContext import
- [x] Set instance at start of functions (if applicable)
- [x] Remove instance from API calls (if applicable)

## Verification

```bash
# Should compile without errors
bun run typecheck

# Test a CLI command
bun run dev list

# Test with specific instance
bun run dev list -i myinstance
```

## Notes

- Command functions still receive `instance` parameter from CLI argument parser
- We set it in the context, then API calls use it automatically
- This maintains backward compatibility with existing CLI interface

## Next Task
`06-update-interface-components.md`
