# Task 10: Final Verification and Cleanup

## Objective
Comprehensive testing and verification that the instance context migration is complete and working correctly.

## Verification Steps

### 1. TypeScript Compilation
```bash
bun run typecheck
```
Expected: No errors

### 2. Search for Remaining Instance Props
```bash
# Search for instance props in components
grep -r "instance: string\|instance?: string" src/tui/components/ --include="*.tsx" --include="*.ts" | wc -l

# Search for instance being passed to components
grep -r "instance={" src/tui/components/ | wc -l
```
Expected: Minimal or zero results

### 3. Search for Old-Style API Calls
```bash
# Search for old graphql calls with instance
grep -r "graphql<.*>(instance," src/

# Search for API calls with instance parameter
grep -r "Api\.\w\+(instance," src/
```
Expected: No results

### 4. Verify InstanceContext Usage
```bash
# Find all files using InstanceContext
grep -r "InstanceContext" src/ --include="*.ts" --include="*.tsx" -l
```
Expected: Should include:
- `src/contexts/InstanceContext.ts` (definition)
- `src/api.ts` (usage)
- `src/tui/AppContent.tsx` (setting instance)
- `src/commands/*.ts` (CLI usage)
- Possibly some components (subscribing)

## Testing

### CLI Commands
Test each CLI command to ensure they work:

```bash
# List pages
bun run dev list

# List pages with specific instance
bun run dev list -i rmwiki

# Delete pages
bun run dev delete "test/*"

# Users commands
bun run dev users list

# Groups commands
bun run dev groups list

# Status
bun run dev status

# Sync
bun run dev sync --dry-run
```

### TUI Testing
Launch TUI and test each interface:

```bash
bun run dev
```

Test each mode:
1. **Command Mode**
   - [ ] Launches correctly
   - [ ] Shows current instance

2. **Users Interface** (`/users`)
   - [ ] Lists users
   - [ ] Create user
   - [ ] Edit user
   - [ ] Delete user
   - [ ] Search users

3. **Groups Interface** (`/groups`)
   - [ ] Lists groups
   - [ ] Create group
   - [ ] Edit group members
   - [ ] Delete group

4. **Pages Interface** (`/pages`)
   - [ ] Lists pages
   - [ ] View page details
   - [ ] Copy pages
   - [ ] Delete pages
   - [ ] Export pages

5. **Navigation Interface** (`/navigation`)
   - [ ] Shows nav tree
   - [ ] Create nav item
   - [ ] Edit nav item
   - [ ] Delete nav item
   - [ ] Move nav item

6. **Status Interface** (`/status`)
   - [ ] Shows instance status
   - [ ] Displays correct info

7. **Sync Interface** (`/sync`)
   - [ ] Shows sync options
   - [ ] Performs sync (dry run)

8. **Analysis Interface** (`/exports`)
   - [ ] Analyzes pages
   - [ ] Shows orphaned pages
   - [ ] Compare operations work

9. **Instance Switching**
   - [ ] Switch instance with `i` command
   - [ ] New instance is used for all operations
   - [ ] No errors when switching

## Performance Check

- [ ] No noticeable performance degradation
- [ ] App startup time unchanged
- [ ] TUI responsive
- [ ] No memory leaks from subscriptions

## Code Quality

```bash
# Run linter
bun run lint
```

Expected: No new linting errors related to instance

## Documentation Update

Update `CLAUDE.md` to document the InstanceContext pattern:

```markdown
### Instance Management

The application uses a global `InstanceContext` singleton to manage the current Wiki.js instance:

- **Setting instance**: `InstanceContext.setInstance('rmwiki')`
- **Getting instance**: `InstanceContext.getInstance()`
- **Subscribing to changes**: `InstanceContext.subscribe((instance) => { ... })`

This eliminates the need to pass `instance` as a prop through component trees. The API layer automatically uses the current instance from the context.

In CLI mode, each command sets the instance at the start. In TUI mode, `AppContent` syncs the instance state with the global context.
```

## Checklist

### TypeScript & Build
- [ ] `bun run typecheck` passes
- [ ] `bun run build` succeeds
- [ ] No TypeScript errors

### Code Search Verification
- [ ] No old-style `graphql(instance, ...)` calls
- [ ] Minimal `instance={...}` prop passing
- [ ] InstanceContext properly imported where used

### CLI Testing
- [ ] All list commands work
- [ ] All create commands work
- [ ] All delete commands work
- [ ] Instance flag (`-i`) works
- [ ] Default instance works

### TUI Testing
- [ ] All interfaces load
- [ ] All operations work
- [ ] Instance switching works
- [ ] No console errors
- [ ] No TypeScript errors in browser/terminal

### Documentation
- [ ] CLAUDE.md updated with InstanceContext info
- [ ] Task files marked complete
- [ ] Any gotchas documented

## Common Issues & Solutions

### Issue: "instance is null" errors
**Solution**: Ensure `InstanceContext.setInstance()` is called before any API calls

### Issue: Old instance used after switching
**Solution**: Verify `AppContent` useEffect is updating the context

### Issue: TypeScript errors about missing instance parameter
**Solution**: Update function signature to remove instance parameter

### Issue: Component still passes instance prop
**Solution**: Remove from component call and props interface

## Success Criteria

Migration is complete when:
1. TypeScript compiles without errors
2. All CLI commands work correctly
3. All TUI interfaces work correctly
4. Instance switching works in TUI
5. No old-style instance prop drilling remains
6. Documentation is updated
7. All tests pass

## Completion

Once all checklists are complete:
- [ ] Move task files to `tasks/completed/instance-context-migration/`
- [ ] Create git commit with migration changes
- [ ] Update project status

## Git Commit

```bash
git add .
git commit -m "$(cat <<'EOF'
Migrate to InstanceContext pattern

Remove instance prop drilling by implementing global InstanceContext singleton.

Changes:
- Created InstanceContext singleton for global instance management
- Updated API layer to use context instead of instance parameter
- Removed instance props from all components
- Updated CLI commands to set instance in context
- Cleaned up type definitions

Benefits:
- Cleaner component interfaces
- Centralized instance management
- Easier to maintain and refactor
- Consistent pattern for both CLI and TUI

Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

## Done!

The instance context migration is complete. The codebase now uses a clean, centralized pattern for instance management without prop drilling.
