# Task 6: Update Interface Components

## Objective
Update main interface components to remove instance from API calls. Keep instance prop temporarily for null checks.

## Files to Modify

Main interface components:
- `src/tui/components/interfaces/users/UsersInterface.tsx`
- `src/tui/components/interfaces/groups/GroupsInterface.tsx`
- `src/tui/components/interfaces/pages/PagesInterface.tsx`
- `src/tui/components/interfaces/navigation/NavInterface.tsx`
- `src/tui/components/interfaces/status/StatusInterface.tsx`
- `src/tui/components/interfaces/sync/SyncInterface.tsx`
- `src/tui/components/interfaces/compare/CompareInterface.tsx`
- `src/tui/components/interfaces/analysis/AnalysisInterface.tsx`
- `src/tui/components/interfaces/pagecopy/PageCopyInterface.tsx`

## Pattern to Follow

### Keep Props Interface (for now)
```typescript
interface UsersInterfaceProps {
  instance: string | null;  // Keep for null checks
  onEsc?: () => void;
}

export function UsersInterface({ instance, onEsc }: UsersInterfaceProps) {
  // Component implementation
}
```

### Remove Instance from API Calls

**Before**:
```typescript
const users = await listUsers(instance, options);
const result = await createUser(instance, userData);
```

**After**:
```typescript
const users = await listUsers(options);
const result = await createUser(userData);
```

### Optional: Subscribe to Instance Changes

If component needs to reload when instance changes:
```typescript
import { InstanceContext } from "@/contexts/InstanceContext";

useEffect(() => {
  const cleanup = InstanceContext.subscribe(() => {
    // Reload data when instance changes
    loadData();
  });
  return cleanup;
}, []);
```

## Checklist

### UsersInterface.tsx
- [ ] Import InstanceContext (if subscribing)
- [ ] Keep instance prop in interface
- [ ] Remove instance from all `userApi.*()` calls
- [ ] Remove instance from all `userProfilesApi.*()` calls
- [ ] Add subscription if needed
- [ ] Verify TypeScript compiles

### GroupsInterface.tsx
- [ ] Import InstanceContext (if subscribing)
- [ ] Keep instance prop in interface
- [ ] Remove instance from all `groupApi.*()` calls
- [ ] Add subscription if needed
- [ ] Verify TypeScript compiles

### PagesInterface.tsx
- [ ] Import InstanceContext (if subscribing)
- [ ] Keep instance prop in interface
- [ ] Remove instance from all `pageApi.*()` calls
- [ ] Add subscription if needed
- [ ] Verify TypeScript compiles

### NavInterface.tsx
- [ ] Import InstanceContext (if subscribing)
- [ ] Keep instance prop in interface
- [ ] Remove instance from all `navigationApi.*()` calls
- [ ] Add subscription if needed
- [ ] Verify TypeScript compiles

### StatusInterface.tsx
- [ ] Import InstanceContext (if subscribing)
- [ ] Keep instance prop in interface
- [ ] Remove instance from all API calls
- [ ] Add subscription if needed
- [ ] Verify TypeScript compiles

### SyncInterface.tsx
- [ ] Import InstanceContext (if subscribing)
- [ ] Keep instance prop in interface
- [ ] Remove instance from all `syncApi.*()` calls
- [ ] Add subscription if needed
- [ ] Verify TypeScript compiles

### CompareInterface.tsx
- [ ] Import InstanceContext (if subscribing)
- [ ] Keep instance prop in interface
- [ ] Remove instance from all API calls
- [ ] Add subscription if needed
- [ ] Verify TypeScript compiles

### AnalysisInterface.tsx
- [ ] Import InstanceContext (if subscribing)
- [ ] Keep instance prop in interface
- [ ] Remove instance from all API calls
- [ ] Add subscription if needed
- [ ] Verify TypeScript compiles

### PageCopyInterface.tsx
- [ ] Import InstanceContext (if subscribing)
- [ ] Keep instance prop in interface
- [ ] Remove instance from all API calls
- [ ] Add subscription if needed
- [ ] Verify TypeScript compiles

## Verification

```bash
# Should compile without errors
bun run typecheck

# Search for old-style API calls in interface files
grep -r "Api\.\w\+(instance," src/tui/components/interfaces/
# Should return no results
```

## Notes

- We're keeping the `instance` prop for now for null checks like `if (!instance) return ...`
- We'll remove the prop completely in Task 7 when updating child components
- Subscription is optional - only add if component needs to react to instance changes

## Next Task
`07-update-child-components.md`
