# Task 7: Update Child Components

## Objective
Remove instance prop from all child components - both from props interfaces and API calls.

## Scope

This is the largest task, affecting 50+ files. Components to update include:

### Users Components (~20 files)
- `AllUsersTab.tsx`
- `CreateUserTab.tsx`
- `ImportExportTab.tsx`
- `ProfilesTab.tsx`
- `GroupSelector.tsx`
- `UserCreateForm.tsx`
- `UserDeleteDialog.tsx`
- `UserDetailView.tsx`
- `UserEditForm.tsx`
- `UserActionMenu.tsx`
- `UsersList.tsx`
- `UsersMenu.tsx`
- `EditProfileModal.tsx`
- `useUserActions.ts`

### Groups Components (~15 files)
- `AllGroupsTab.tsx`
- `AddUsersTab.tsx`
- `MembersTab.tsx`
- `OrphanedUsersTab.tsx`
- `OrphanedUsersView.tsx`
- `GroupActionMenu.tsx`
- `GroupCreateForm.tsx`
- `GroupDeleteDialog.tsx`
- `GroupDetailView.tsx`
- `GroupMembersManager.tsx`
- `GroupPageRulesView.tsx`
- `GroupPermissionsView.tsx`
- `GroupsList.tsx`
- `GroupsMainMenu.tsx`
- Hooks files

### Pages Components (~12 files)
- `AllPagesTab.tsx`
- `DeleteTab.tsx`
- `ExportTab.tsx`
- `PageDetails.tsx`
- `InfoTab.tsx`
- `ContentTab.tsx`
- `MetaTab.tsx`
- `ActionsTab.tsx`
- `ConvertEditorDialog.tsx`
- `MovePageDialog.tsx`
- All hooks files

### Navigation Components (~12 files)
- `NavTree.tsx`
- `NavItemForm.tsx`
- `NavItemFormField.tsx`
- `NavItemFormButtons.tsx`
- `NavExportForm.tsx`
- `NavImportForm.tsx`
- `NavModeSelector.tsx`
- `NavItemMoveInterface.tsx`
- `NavItemPlacementPreview.tsx`
- `NavItemTreePreview.tsx`
- `NavDeleteInterface/` files

### Analysis Components (~8 files)
- `AnalyzeTab.tsx`
- `CompareTab.tsx`
- `CompareNavTab.tsx`
- `ComparePagesTab.tsx`
- `OrphanedTab.tsx`
- `AnalysisResultsView.tsx`
- `ComparisonResultsView.tsx`
- Hooks files

### Other Components
- `PageCopyInterface/` components
- `PageBrowser.tsx`
- `DeletePageSelector.tsx`
- `MarkedPagesForDeletion.tsx`
- `MarkedPagesSummary.tsx`
- `PageSelector.tsx`
- Sync components
- Compare components

## Pattern to Follow

### Remove from Props Interface

**Before**:
```typescript
interface UserCreateFormProps {
  instance: string | null;
  onComplete: () => void;
  onCancel: () => void;
}

export function UserCreateForm({
  instance,
  onComplete,
  onCancel
}: UserCreateFormProps) {
  await createUser(instance, userData);
}
```

**After**:
```typescript
interface UserCreateFormProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function UserCreateForm({
  onComplete,
  onCancel
}: UserCreateFormProps) {
  await createUser(userData);
}
```

### Remove from Component Calls

**Before**:
```typescript
<UserCreateForm
  instance={instance}
  onComplete={handleComplete}
/>
```

**After**:
```typescript
<UserCreateForm
  onComplete={handleComplete}
/>
```

## Strategy

Work directory by directory to maintain focus:

1. **Users directory** - Update all files, test users interface
2. **Groups directory** - Update all files, test groups interface
3. **Pages directory** - Update all files, test pages interface
4. **Navigation directory** - Update all files, test navigation interface
5. **Analysis directory** - Update all files, test analysis interface
6. **Remaining directories** - Update all files, test interfaces

## Checklist

### Users Directory
- [x] `AllUsersTab.tsx`
- [x] `CreateUserTab.tsx`
- [x] `ImportExportTab.tsx`
- [x] `ProfilesTab.tsx`
- [x] `GroupSelector.tsx`
- [x] `UserCreateForm.tsx`
- [x] `UserDeleteDialog.tsx`
- [x] `UserDetailView.tsx`
- [x] `UserEditForm.tsx`
- [x] `UserActionMenu.tsx`
- [x] `UsersList.tsx`
- [x] `UsersMenu.tsx`
- [x] `EditProfileModal.tsx`
- [x] `useUserActions.ts`
- [x] Test users interface works

### Groups Directory
- [x] `AllGroupsTab.tsx`
- [x] `AddUsersTab.tsx`
- [x] `MembersTab.tsx`
- [x] `OrphanedUsersTab.tsx`
- [x] `OrphanedUsersView.tsx`
- [x] `GroupActionMenu.tsx`
- [x] `GroupCreateForm.tsx`
- [x] `GroupDeleteDialog.tsx`
- [x] `GroupDetailView.tsx`
- [x] `GroupMembersManager.tsx`
- [x] `GroupPageRulesView.tsx`
- [x] `GroupPermissionsView.tsx`
- [x] `GroupsList.tsx`
- [x] `GroupsMainMenu.tsx`
- [x] Hook files
- [x] Test groups interface works

### Pages Directory
- [x] `AllPagesTab.tsx`
- [x] `DeleteTab.tsx`
- [x] `ExportTab.tsx`
- [x] `PageDetails.tsx`
- [x] `InfoTab.tsx`
- [x] `ContentTab.tsx`
- [x] `MetaTab.tsx`
- [x] `ActionsTab.tsx`
- [x] `ConvertEditorDialog.tsx`
- [x] `MovePageDialog.tsx`
- [x] Hook files
- [x] Test pages interface works

### Navigation Directory
- [~] `NavTree.tsx` (mostly done, some have unused instance prop)
- [~] `NavItemForm.tsx` (mostly done)
- [~] `NavItemFormField.tsx` (mostly done)
- [~] `NavItemFormButtons.tsx` (mostly done)
- [ ] `NavExportForm.tsx` - NEEDS CLEANUP
- [ ] `NavImportForm.tsx` - NEEDS CLEANUP
- [~] `NavModeSelector.tsx` (mostly done)
- [ ] `NavItemMoveInterface.tsx` - NEEDS CLEANUP
- [~] `NavItemPlacementPreview.tsx` (mostly done)
- [~] `NavItemTreePreview.tsx` (mostly done)
- [ ] `NavDeleteInterface/NavDeleteModal.tsx` - NEEDS CLEANUP
- [~] Test navigation interface works

### Analysis Directory
- [ ] `AnalyzeTab.tsx` - NEEDS CLEANUP (passing instance to children)
- [ ] `CompareTab.tsx` - NEEDS CLEANUP (passing instance to children)
- [ ] `CompareNavTab.tsx` - NEEDS CLEANUP (passing instance to children)
- [ ] `ComparePagesTab.tsx` - NEEDS CLEANUP (passing instance to children)
- [x] `OrphanedTab.tsx`
- [x] `AnalysisResultsView.tsx`
- [x] `ComparisonResultsView.tsx`
- [x] Hook files
- [~] Test analysis interface works

### Sync Components
- [ ] `SyncConfirmation.tsx` - NEEDS CLEANUP
- [ ] `SyncOptions.tsx` - NEEDS CLEANUP
- [ ] `SyncInterface.tsx` - NEEDS CLEANUP (passing instance to children)

### Other Components
- [x] `PageCopyInterface/` components
- [x] `PageBrowser.tsx`
- [x] `DeletePageSelector.tsx`
- [x] `MarkedPagesForDeletion.tsx`
- [x] `MarkedPagesSummary.tsx`
- [x] `PageSelector.tsx`
- [x] Compare components
- [~] Test all interfaces work

## Remaining Work Summary

Only **11 files** need final cleanup:

**Navigation (4 files):**
- NavExportForm.tsx
- NavImportForm.tsx
- NavItemMoveInterface.tsx
- NavDeleteModal.tsx

**Analysis (4 files):**
- AnalyzeTab.tsx
- CompareTab.tsx
- CompareNavTab.tsx
- ComparePagesTab.tsx

**Sync (3 files):**
- SyncConfirmation.tsx
- SyncOptions.tsx
- SyncInterface.tsx

## Verification

After each directory:
```bash
# TypeScript should compile
bun run typecheck

# Test the relevant interface in TUI
bun run dev
# Navigate to the interface and test operations
```

Final verification:
```bash
# Search for remaining instance props
grep -r "instance: string\|instance?: string" src/tui/components/ --include="*.tsx" --include="*.ts"
# Should only show a few interface components that truly need it

# Search for instance being passed to children
grep -r "instance={" src/tui/components/
# Should return minimal results
```

## Notes

- This is the most time-consuming task
- Work incrementally and test as you go
- Some components may genuinely need instance for conditional rendering
- Focus on removing it from API calls first, then from props

## Next Task
`08-update-mode-renderer.md`
