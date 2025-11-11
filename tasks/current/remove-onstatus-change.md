# Remove onStatusChange Prop - Complete Decoupling

## Problem
Interfaces still receive `onStatusChange` callback from parent, but they already use `useFooterStatus` from FooterContext. This is redundant coupling.

## Goal
Remove ALL `onStatusChange` props. Interfaces manage their own status via `useFooterStatus`.

## Tasks

### 1. Update Interface Props
Remove `onStatusChange` from these interface prop types:

- [x] `PagesInterface` - src/tui/components/interfaces/pages/PagesInterface.tsx
- [x] `AnalysisInterface` - src/tui/components/interfaces/analysis/AnalysisInterface.tsx
- [x] `SearchInterface (InteractiveSearch)` - src/tui/components/interfaces/search/InteractiveSearch.tsx
- [x] `DeleteInterface` - src/tui/components/interfaces/delete/DeleteInterface.tsx (removed from ModeRenderer)
- [x] `PageCopyInterface` - src/tui/components/interfaces/pagecopy/PageCopyInterface.tsx (removed from ModeRenderer)
- [x] `CompareInterface` - src/tui/components/interfaces/compare/CompareInterface.tsx (removed from ModeRenderer)
- [x] `StatusInterface` - src/tui/components/interfaces/status/StatusInterface.tsx (removed from ModeRenderer)
- [x] `SyncInterface` - src/tui/components/interfaces/sync/SyncInterface.tsx (removed from ModeRenderer)
- [x] `NavInterface` - src/tui/components/interfaces/navigation/NavInterface.tsx (removed from ModeRenderer)
- [x] `UsersInterface` - src/tui/components/interfaces/users/UsersInterface.tsx (removed from ModeRenderer)
- [x] `GroupsInterface` - src/tui/components/interfaces/groups/GroupsInterface.tsx (removed from ModeRenderer)
- [x] `ConfigInterface` - src/tui/components/interfaces/config/ConfigInterface.tsx (removed from ModeRenderer)

### 2. Update Interface Implementations
For each interface that receives `onStatusChange`:

- [x] Remove from function parameters
- [x] Remove any calls to `onStatusChange(message)`
- [x] Ensure using `useFooterStatus` or local state instead
- [x] Verify: interfaces already have local status state that feeds into `useFooterStatus`

### 3. Update PageDetails
- [x] Remove `onStatusChange` prop from PageDetails component
- [x] Update all places that render PageDetails (AnalysisInterface, PagesInterface, SearchInterface)
- [x] PageDetails should use `useFooterStatus` directly

### 4. Update ModeRenderer
Remove `onStatusChange` from ALL interface calls:

- [x] Remove `setStatusMessage` from ModeRendererProps
- [x] Remove from function parameters
- [x] Remove from ALL case statements (pages, search, delete, copy, compare, status, sync, navigation, users, groups, config, exports, setup)

### 5. Update AppContent
- [x] Remove `setStatusMessage` from ModeRenderer call
- [x] Keep only: `statusMessage` for Footer display (FooterContext provides this)
- [x] AppContent should NOT manage status - only display what FooterContext provides

### 6. Final AppContent State
After this refactor, AppContent should ONLY have:

```tsx
const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.COMMAND);
const [currentInstance, setCurrentInstance] = useState<string | null>(null);
const [searchQuery, setSearchQuery] = useState(""); // Will remove later
const [checkingSetup, setCheckingSetup] = useState(true);
```

### 7. Final ModeRenderer Props
After this refactor:

```tsx
interface ModeRendererProps {
  currentMode: AppMode;
  currentInstance: string | null;
  searchQuery: string; // Will remove later
  handleCommand: (command: string, args?: string) => void;
  handleEscape: () => void;
  setCurrentMode: (mode: AppMode) => void;
  setCurrentInstance: (instance: string | null) => void;
}
```

## Pattern
Interfaces use FooterContext directly:

```tsx
// Inside interface:
const [statusMsg, setStatusMsg] = useState("");
useFooterStatus(statusMsg);

// When something happens:
setStatusMsg("Operation completed successfully");
// Footer automatically updates via context!
```

## Verification
After completion:
- [x] No interface receives `onStatusChange` prop
- [x] All interfaces use `useFooterStatus` for status messages
- [x] ModeRenderer doesn't pass `setStatusMessage` to any interface
- [x] AppContent only displays footer (doesn't manage status)

## Note
After this, we'll remove `searchQuery` in a separate task. One step at a time.
