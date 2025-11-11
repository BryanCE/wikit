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
- [ ] `AllUsersTab.tsx`
- [ ] `CreateUserTab.tsx`
- [ ] `ImportExportTab.tsx`
- [ ] `ProfilesTab.tsx`
- [ ] `GroupSelector.tsx`
- [ ] `UserCreateForm.tsx`
- [ ] `UserDeleteDialog.tsx`
- [ ] `UserDetailView.tsx`
- [ ] `UserEditForm.tsx`
- [ ] `UserActionMenu.tsx`
- [ ] `UsersList.tsx`
- [ ] `UsersMenu.tsx`
- [ ] `EditProfileModal.tsx`
- [ ] `useUserActions.ts`
- [ ] Test users interface works

### Groups Directory
- [ ] `AllGroupsTab.tsx`
- [ ] `AddUsersTab.tsx`
- [ ] `MembersTab.tsx`
- [ ] `OrphanedUsersTab.tsx`
- [ ] `OrphanedUsersView.tsx`
- [ ] `GroupActionMenu.tsx`
- [ ] `GroupCreateForm.tsx`
- [ ] `GroupDeleteDialog.tsx`
- [ ] `GroupDetailView.tsx`
- [ ] `GroupMembersManager.tsx`
- [ ] `GroupPageRulesView.tsx`
- [ ] `GroupPermissionsView.tsx`
- [ ] `GroupsList.tsx`
- [ ] `GroupsMainMenu.tsx`
- [ ] Hook files
- [ ] Test groups interface works

### Pages Directory
- [ ] `AllPagesTab.tsx`
- [ ] `DeleteTab.tsx`
- [ ] `ExportTab.tsx`
- [ ] `PageDetails.tsx`
- [ ] `InfoTab.tsx`
- [ ] `ContentTab.tsx`
- [ ] `MetaTab.tsx`
- [ ] `ActionsTab.tsx`
- [ ] `ConvertEditorDialog.tsx`
- [ ] `MovePageDialog.tsx`
- [ ] Hook files
- [ ] Test pages interface works

### Navigation Directory
- [ ] `NavTree.tsx`
- [ ] `NavItemForm.tsx`
- [ ] `NavItemFormField.tsx`
- [ ] `NavItemFormButtons.tsx`
- [ ] `NavExportForm.tsx`
- [ ] `NavImportForm.tsx`
- [ ] `NavModeSelector.tsx`
- [ ] `NavItemMoveInterface.tsx`
- [ ] `NavItemPlacementPreview.tsx`
- [ ] `NavItemTreePreview.tsx`
- [ ] `NavDeleteInterface/` files
- [ ] Test navigation interface works

### Analysis Directory
- [ ] `AnalyzeTab.tsx`
- [ ] `CompareTab.tsx`
- [ ] `CompareNavTab.tsx`
- [ ] `ComparePagesTab.tsx`
- [ ] `OrphanedTab.tsx`
- [ ] `AnalysisResultsView.tsx`
- [ ] `ComparisonResultsView.tsx`
- [ ] Hook files
- [ ] Test analysis interface works

### Other Components
- [ ] `PageCopyInterface/` components
- [ ] `PageBrowser.tsx`
- [ ] `DeletePageSelector.tsx`
- [ ] `MarkedPagesForDeletion.tsx`
- [ ] `MarkedPagesSummary.tsx`
- [ ] `PageSelector.tsx`
- [ ] Sync components
- [ ] Compare components
- [ ] Test all interfaces work

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
