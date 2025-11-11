# Task 8: Update ModeRenderer

## Objective
Remove instance prop from all interface component calls in ModeRenderer.

## Files to Modify
- `src/tui/components/app/ModeRenderer.tsx`

## Changes Required

Remove `instance={currentInstance}` from all interface component instantiations.

### Before
```typescript
case AppMode.USERS:
  return (
    <UsersInterface
      instance={currentInstance}
      onEsc={handleEscape}
    />
  );

case AppMode.GROUPS:
  return (
    <GroupsInterface
      instance={currentInstance}
      onEsc={handleEscape}
    />
  );
```

### After
```typescript
case AppMode.USERS:
  return (
    <UsersInterface
      onEsc={handleEscape}
    />
  );

case AppMode.GROUPS:
  return (
    <GroupsInterface
      onEsc={handleEscape}
    />
  );
```

## Interfaces to Update

Update all mode cases:
- `AppMode.USERS` → `UsersInterface`
- `AppMode.GROUPS` → `GroupsInterface`
- `AppMode.PAGES` → `PagesInterface`
- `AppMode.NAVIGATION` → `NavInterface`
- `AppMode.STATUS` → `StatusInterface`
- `AppMode.SYNC` → `SyncInterface`
- `AppMode.COMPARE` → `CompareInterface`
- `AppMode.EXPORTS` → `AnalysisInterface`
- `AppMode.COPY_PAGES` → `PageCopyInterface`
- Any other interface components

## Checklist

- [ ] Remove `instance={currentInstance}` from UsersInterface
- [ ] Remove `instance={currentInstance}` from GroupsInterface
- [ ] Remove `instance={currentInstance}` from PagesInterface
- [ ] Remove `instance={currentInstance}` from NavInterface
- [ ] Remove `instance={currentInstance}` from StatusInterface
- [ ] Remove `instance={currentInstance}` from SyncInterface
- [ ] Remove `instance={currentInstance}` from CompareInterface
- [ ] Remove `instance={currentInstance}` from AnalysisInterface
- [ ] Remove `instance={currentInstance}` from PageCopyInterface
- [ ] Remove from any other interface components
- [ ] Check if `currentInstance` variable is still needed elsewhere
- [ ] TypeScript compiles without errors

## Verification

```bash
# Should compile without errors
bun run typecheck

# Search for instance prop being passed
grep "instance={" src/tui/components/app/ModeRenderer.tsx
# Should return no results (or very few if some components truly need it)
```

## Testing

Launch TUI and test each mode:
```bash
bun run dev

# In TUI, test each command:
/users
/groups
/pages
/navigation
/status
/sync
/compare
/exports
```

All modes should work correctly with instance from context.

## Notes

- After this task, instance prop should be completely removed from the component tree
- Components get instance from InstanceContext.getInstance() when needed
- The `currentInstance` state in AppContent might still be needed for UI display

## Next Task
`09-update-types.md`
