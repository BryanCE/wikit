# Exports Analysis Feature - Implementation Documentation

## Overview

Built a complete TUI and CLI tool for analyzing Wiki.js export files. The feature detects orphaned pages, broken navigation links, title inconsistencies, and provides health scores. Also includes export comparison to see what changed between snapshots.

## Command Name

**TUI Command:** `/exports`

- No aliases (previously had /analyze and /analysis but removed per user preference - single descriptive name only)

## CLI Commands

### Analyze Single Export

```bash
wikit analyze <pages-export.json> <nav-export.json> [options]

Options:
  --orphaned      Show only orphaned pages
  --broken        Show only broken links
  --coverage      Show only coverage stats
  --consistency   Show only title inconsistencies
  --health        Show only health score
  --duplicates    Show only duplicate paths
  --visibility    Show only visibility analysis
```

### Compare Two Exports

```bash
wikit compare-exports <old-pages> <new-pages> <old-nav> <new-nav>
```

## File Structure

### Commands

- `src/commands/analyze.ts` - CLI analyze command implementation
- `src/commands/compareExports.ts` - CLI compare command implementation
- `src/commands/index.ts` - Exports both commands

### Core Analysis Logic

- `src/utils/analyzer.ts` - All analysis functions:
  - `findOrphanedPages()` - Pages not in navigation
  - `findBrokenNavLinks()` - Nav links to missing/unpublished pages
  - `findTitleInconsistencies()` - Nav labels vs page titles
  - `findDuplicatePaths()` - Duplicate page paths
  - `calculateNavigationCoverage()` - Coverage statistics
  - `analyzeVisibility()` - Visibility group analysis
  - `calculateHealthScore()` - Overall wiki health
  - `analyzeExports()` - Main analysis function
  - `compareExports()` - Export diff comparison

### Types

- `src/types/analysis/analysisTypes.ts`:
  - `OrphanedPage`, `BrokenNavLink`, `TitleInconsistency`, `DuplicatePath`
  - `NavigationCoverage`, `VisibilityAnalysis`, `HealthScore`
  - `AnalysisResult` - Complete analysis results
  - `ExportDiffResult` - Comparison results (NOT ComparisonResult - that's for instance diffs)
- `src/types/navigation/navigationTypes.ts`:
  - Added `NavigationExportData` interface
- `src/types/diff/diffTypes.ts`:
  - `InstanceDiffResult` (renamed from ComparisonResult for clarity)

### TUI Components

**Main Interface:**

- `src/tui/components/interfaces/analysis/AnalysisInterface.tsx`
  - Two tabs: "1. Analyze Export" | "2. Compare Exports"
  - Uses custom keyboard hook pattern (like PagesInterface/UsersInterface)
  - Mode flags: `inAnalyzeContent`, `inCompareContent`
  - Proper muted styling when not in content mode

**Tab Components:**

- `src/tui/components/interfaces/analysis/AnalyzeTab.tsx`

  - File selection form (pages export + nav export)
  - FileBrowserModal integration with .json filtering
  - Shows AnalysisResultsView when complete

- `src/tui/components/interfaces/analysis/CompareTab.tsx`
  - File selection form (4 files: old/new pages, old/new nav)
  - Shows ComparisonResultsView when complete

**Results Views:**

- `src/tui/components/interfaces/analysis/AnalysisResultsView.tsx`

  - Health score at top (color-coded)
  - VirtualizedList for scrollable results
  - Sections: health score, coverage, orphaned pages, broken links, inconsistencies, duplicates, visibility

- `src/tui/components/interfaces/analysis/ComparisonResultsView.tsx`
  - Summary stats at top
  - VirtualizedList for scrollable changes
  - Color-coded: green=added, red=removed, yellow=modified

**Keyboard Navigation:**

- `src/tui/components/interfaces/analysis/hooks/useAnalysisKeyboard.ts`
  - Handles tab-level navigation (Tab, arrow keys, 1/2 number shortcuts)

### Integration Points

**TUI Integration (AppContent.tsx):**

- Added `AppMode.EXPORTS` enum value
- Added case handler: `case "exports": setCurrentMode(AppMode.EXPORTS)`
- Renders AnalysisInterface in renderContent()

**Help System:**

- `src/tui/commands.ts` - Added exports command to COMMANDS array
- `src/tui/components/navigation/HelpScreen.tsx` - Added detailed help entry

## Critical Implementation Patterns (MUST FOLLOW)

### Tab Interface Pattern

Based on PagesInterface and UsersInterface - these are THE reference implementations:

1. **Mode Flags:** `inTabContent` boolean for each tab
2. **Custom Keyboard Hook:** Extract keyboard logic to `hooks/useInterfaceKeyboard.ts`
3. **Tab Navigation Rules:**

   - Tab key: ALWAYS switches tabs, exits content modes
   - ←→ arrows: Switch tabs ONLY when NOT in content
   - 1/2 number keys: Quick jump, ALWAYS work, exit content modes
   - ↓ arrow: Enter content from tab bar
   - ↑ arrow at position 0: Exit content back to tab bar

4. **Visual States (CRITICAL):**

   - **When NOT in content (`!inContent`):**
     - All text: `theme.colors.muted` (grayed out)
     - No arrows (" ► ")
     - No background highlights
     - No bold text
   - **When IN content (`inContent`):**
     - Selected item: `theme.colors.primary`, bold, " ► " arrow, background highlight
     - Unselected items: `theme.colors.text` or appropriate colors
     - Full interactivity

5. **Footer Help Text:** Dynamic based on currentTab and inContent state

6. **Escape Handler:**
   - If in content: exit content
   - If not in content: exit interface

### Example Pattern from AllPagesTab.tsx (lines 56-72)

```tsx
const prefix = isHighlighted && inPagesContent ? " ► " : "  ";

const textColor = !inPagesContent
  ? theme.colors.muted
  : isHighlighted
  ? theme.colors.background
  : theme.colors.success;

return (
  <Text
    color={textColor}
    backgroundColor={
      isHighlighted && inPagesContent ? theme.colors.primary : undefined
    }
    bold={isHighlighted && inPagesContent}
  >
    {prefix}
    {content}
  </Text>
);
```

## What Still Needs Work

### Small Changes Needed:

1. **Better error handling** - Currently just shows error text, could use better UI
2. **Loading states** - Analysis takes time, could show progress indicators
3. **Export from TUI** - Currently can only analyze existing files, could add export functionality
4. **Keyboard shortcuts in results** - Results views are basic, could add filtering/sorting
5. **Help text in results** - Results views show "c=close" but should use proper keyboard constants
6. **Empty state handling** - Better messaging when no issues found (celebrate!)
7. **File validation** - Validate JSON structure before attempting analysis
8. **Recent files list** - Remember last analyzed files for quick re-analysis

### Architecture Improvements:

1. **Results tabs** - Results could be tabbed by category (health, orphaned, broken, etc.)
2. **Export results** - Save analysis results to file for reporting
3. **Batch analysis** - Analyze multiple export pairs at once
4. **Scheduled monitoring** - Track health scores over time

## Key Learnings for Future Features

1. **Always use custom keyboard hooks** - Don't inline useInput in main component
2. **Muted state is CRITICAL** - Users need visual feedback about what's active
3. **Arrow indicators matter** - " ► " only when actually in content
4. **Follow PagesInterface/UsersInterface** - They are the gold standard
5. **Single descriptive command names** - No aliases, clear purpose
6. **VirtualizedList for scrolling** - Don't manually calculate heights
7. **Type naming conventions:**
   - `InstanceDiffResult` for comparing instances
   - `ExportDiffResult` for comparing exports
   - Be specific to avoid confusion

## Testing the Feature

### TUI:

1. `bun run dev` then `wikit tui`
2. Type `/exports`
3. Tab to switch between Analyze/Compare tabs
4. ↓ to enter tab content (notice content changes from muted to active)
5. ↑ at top to exit back to tab bar (notice content becomes muted)
6. Select files with Space/Enter
7. Browse files in FileBrowserModal
8. Run analysis/comparison
9. Scroll results with ↑↓
10. Press 'c' to close results

### CLI:

```bash
wikit analyze Exports/pages-export-2025-10-14.json Exports/navigation-export-2025-10-14.json
wikit analyze Exports/pages-export-2025-10-14.json Exports/navigation-export-2025-10-14.json --health --orphaned
```

## References

- See `src/tui/components/interfaces/pages/PagesInterface.tsx` - Reference implementation
- See `src/tui/components/interfaces/users/UsersInterface.tsx` - Reference implementation
- See `src/tui/components/interfaces/pages/hooks/usePagesKeyboard.ts` - Keyboard hook example
- See `src/tui/components/interfaces/pages/AllPagesTab.tsx` - Muted state example (lines 56-72)

## Common Mistakes to Avoid

1. ❌ Using multiple aliases for commands
2. ❌ Showing arrows when not in content
3. ❌ Full color content when not in content mode
4. ❌ Inline useInput in main interface component
5. ❌ Type name collisions (ComparisonResult was used twice!)
6. ❌ Not following the established keyboard navigation patterns
7. ❌ Forgetting to export from src/commands/index.ts
8. ❌ Not adding to help screen AND command preview (they share COMMANDS array)
