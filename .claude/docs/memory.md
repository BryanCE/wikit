# TUI Development Patterns

## CRITICAL CONTEXT PATTERNS

### Header Context - USES A STACK (NEVER FORGET THIS)

**HeaderContext maintains a stack like EscapeContext. Previous values restore automatically on unmount.**

```tsx
// Component mounts → pushes to stack
// Component unmounts → pops, previous header restores
// Top of stack = displayed header

// Any component can set header
useHeaderData({ title: "My Component", metadata: "some data" });

// When component unmounts, previous header from stack shows automatically
```

**Implementation (HeaderContext.tsx):**
- Maintains `stackRef.current: HeaderStackItem[]`
- `pushHeaderData()` adds to stack
- Cleanup pops from stack and restores previous
- Identical pattern to EscapeContext

**Rule: Set header anywhere. Stack handles restoration. DO NOT manually clear or manage headers.**

### Footer Context - TWO SEPARATE STACKS

**FooterContext uses TWO independent stacks: one for help text, one for status.**

```tsx
// OPTIONAL - only call if you need to override
useFooterHelp("↑↓ navigate • Enter select • Esc back");
useFooterStatus("5 items selected");

// If child passes empty string (""), it doesn't push/stays off stack
// Parent's value shows through automatically
```

**How it works:**
- Mount with content → push to stack (stable position)
- Mount with empty string → don't push (parent shows through)
- Value changes → update in place OR add/remove from stack
- Empty string → remove from stack (restore parent)
- Unmount → pop from stack if present
- Top of each stack = displayed value

**Key insight: Empty strings don't override**
- Child calls `useFooterStatus("")` → parent's status shows through
- Child calls `useFooterStatus("5 selected")` → displays on top
- Child updates back to `""` → removes from stack, parent shows through

**Implementation:**
```tsx
// Mount: only push if non-empty
if (message) {
  push to stack
}

// Update: add to stack when message gets content, remove when empty
if (message) {
  add or update in stack
} else {
  remove from stack if present
}
```

**Rule: Always call hooks. Empty values are smart - they let parent show through.**

### Escape Context - USES A STACK

**EscapeContext maintains a stack. Only top handler executes.**

See [escape-handling-system.md](./escape-handling-system.md) for full details.

**Rule: Parent interface has ONE useEscape. Children are dumb.**

## Core Utilities

### Logging (`@/utils/logger`)

**NEVER `console.log()` - TUI doesn't show it. ALWAYS use `logger`.**

- Log: errors (always), API calls, state changes
- Don't log: renders, hot paths, icon formatting
- `logger.{info|error|debug|warn}()`
- Location: `~/.config/wikit/logs/wikit.log`

### Contexts (ALWAYS use these)

- `useTheme()` - ALL colors from `theme.colors.*` (NEVER hardcode)
- `useFooterHelp(text)` - OPTIONAL stack-based - only call to override, parent shows through
- `useFooterStatus(msg)` - OPTIONAL stack-based - only call to override, parent shows through
- `useHeaderData({ title, metadata })` - STACK-BASED - set anywhere, previous values restore on unmount
- `useEscape(id, handler)` - STACK-BASED - parent only handles, children are dumb

### Reusable Components

- `VirtualizedList` - auto-scrolling lists
- `ContentScroller` - plain text scrolling
- `AsyncActionDialog` - **ALL mutations** (delete, add, move, import, mode change, etc.)
- `FileBrowserModal`, `ActionMenu`, `PageDetailsModal`
- `TextInput` (from `ink-text-input`) - text input with cursor navigation

**CRITICAL: ConfirmationDialog is deprecated - ALWAYS use AsyncActionDialog for any mutation.**

### Text Input (ink-text-input)

**NEVER manually handle text input. ALWAYS use `TextInput` from `ink-text-input`.**

```tsx
import TextInput from "ink-text-input";

<TextInput
  value={inputValue}
  onChange={setInputValue}
  placeholder="Enter text..."
  focus={isEditing}
  showCursor={true}
/>
```

- Handles cursor navigation (←→), backspace, character insertion automatically
- Set `focus={true}` when field is being edited
- Remove manual `key.backspace`, `key.leftArrow`, `key.rightArrow`, character input handling

### Keyboard Constants (`keyboard.ts`)

- Use `COMMON_HELP_PATTERNS.{LIST|MENU|MULTI_SELECT}`
- `formatHelpText(...actions)` joins with " • "

## Component Rules

### Props by Type

- **Interface**: `{ instance, onStatusChange, onEsc? }`
- **Form/Dialog**: `{ instance, onSuccess, onStatusChange }`

### Keyboard (STRICT - NEVER deviate)

- ↑↓ navigate lists, →← navigate trees
- Space toggles/selects
- Enter confirms/submits/opens
- Escape backs/cancels
- **EXCEPTION: 's' key for search** - only allowed letter shortcut (see Search Pattern below)
- Use `COMMON_HELP_PATTERNS` from `keyboard.ts`

### Search Pattern (WITH SearchBar component)

**CRITICAL: Number keys (1-4) for tab switching conflict with search input.**

**Solution: 's' key activates dedicated search mode**

```tsx
// State
const [searchQuery, setSearchQuery] = useState("");
const [inSearchMode, setInSearchMode] = useState(false);

// Keyboard handling
if (input === "s" && !inSearchMode) {
  setInSearchMode(true); // Works from tab bar OR content
  return;
}

if (inSearchMode) {
  // ALL typing goes to search (including numbers 1-4)
  if (input && input.length === 1) {
    setSearchQuery((prev) => prev + input);
    return;
  }
  if (key.backspace) {
    setSearchQuery((prev) => prev.slice(0, -1));
    return;
  }
  if (key.downArrow) {
    setInSearchMode(false); // Exit search, enter content
    setInContent(true);
    return;
  }
}

// Escape handling
if (inSearchMode) {
  setInSearchMode(false); // First Esc exits search mode
  return;
}
if (searchQuery) {
  setSearchQuery(""); // Second Esc clears search term
  return;
}
```

**SearchBar props:**
- `isActive={inSearchMode}` - highlights border when active
- `placeholder="Press 's' to search..."` - tell users how to activate

**Footer help text:**
- Tab bar: "s=search • ↓ enter list • Esc back"
- Search mode: "Type to search • ↓ enter results • Esc exit search"
- Content: "s=search • ↑↓ navigate • Enter select • ↑ to tab bar"

**Why this pattern:**
- 's' key doesn't conflict with tab numbers (1-4)
- Search mode = dedicated context where ALL keys go to search
- Clear visual feedback via SearchBar border
- Works from tab bar OR content area
- Esc exits mode, then clears query, then exits interface

**References:** PagesInterface, UsersInterface (users + profiles tabs)

### VirtualizedList (ALWAYS use for lists)

**NEVER manually slice arrays or calculate scroll positions - use VirtualizedList.**

- Parent: `<Box flexGrow={1}>`
- Items: `<Box height={itemHeight} flexShrink={0}>`
- Props: `items`, `selectedIndex`, `itemHeight`, `getItemKey`, `renderItem`
- Handles scrolling automatically

### Ink Layout Rules

**NEVER `position="absolute"` - causes empty rectangles. ALWAYS use flexbox.**

- Use: `flexDirection`, `flexGrow`, `flexShrink`, `justifyContent`, `alignItems`
- NEVER hardcode width/height - use flex sizing
- NEVER emoji chars (🎉❌✓) - use text: `[✓][X][LOCK]`

### GraphQL (CRITICAL)

**NEVER use `pages.single(id)` - causes empty purple rectangles.**

- ✅ ALWAYS use `pages.singleByPath(path, locale)` with BOTH params
- Why: ID lookups fail in certain contexts, path lookups are reliable

## Interface Patterns

### State & Modes

```tsx
type Mode = "list" | "action" | "detail";
const [mode, setMode] = useState<Mode>("list");
const [items, setItems] = useState<T[]>([]);
const [selectedIndex, setSelectedIndex] = useState(0);
const [loading, setLoading] = useState(true);

useEscape("id", () => (mode === "list" ? onEsc?.() : setMode("list")));
```

### Load Pattern

```tsx
const loadItems = async () => {
  setLoading(true);
  try {
    const list = await api.listItems(instance);
    setItems(list);
    onStatusChange(`Loaded ${list.length} items`);
  } catch (error) {
    onStatusChange(
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
  } finally {
    setLoading(false);
  }
};
```

### Multi-Select Pattern

```tsx
const [markedItems, setMarkedItems] = useState<Set<string>>(new Set());
// Space toggles, ConfirmationDialog before action
```

### Render Order

```tsx
if (loading) return <Text>Loading...</Text>;
if (error) return <Text>Error: {error}</Text>;
if (confirmMode) return <ConfirmationDialog />;
if (mode === "detail") return <DetailView />;
return <ListView />;
```

### Instance Propagation (CRITICAL)

**ALWAYS pass `instance` and callbacks through ENTIRE component chain.**

- `instance` must reach every component that calls API
- Callbacks (`onPageSelect`, `onStatusChange`) must propagate down
- NEVER skip levels - breaks functionality

## Tab-Based Interfaces (STRICT PATTERN)

**Tabs are PURELY presentational. Parent owns ALL state, ALL navigation, ALL logic.**

### CRITICAL RULES (NEVER violate)

1. **Parent owns ALL state** - tabs have ZERO useState
2. **Parent conditionally renders** - `{result ? <Results /> : <Form />}`
3. **NO useInput in tabs** - parent keyboard hook handles everything
4. **NO useEscape in tabs** - only parent has ONE useEscape
5. **Tabs receive everything as props** - no internal logic

### State Pattern

```tsx
const [currentTab, setCurrentTab] = useState<"tab1" | "tab2">("tab1");
const [inTab1Content, setInTab1Content] = useState(false);
const [inTab2Content, setInTab2Content] = useState(false);
// ALL tab state lives in parent
```

### Navigation States

- **Tab bar focused** (`inXContent: false`) - can switch tabs
- **Content focused** (`inXContent: true`) - interact with content
- `↓` enters content, `↑` exits to tab bar
- `Tab`, `←→`, `1-2` ALWAYS exit content & switch tabs

### Keyboard Hook (`useXKeyboard.ts`)

```tsx
// Tab key exits content, switches tabs
// Arrow keys switch tabs only when NOT in content
// Number keys (1-2) quick switch
// Down arrow enters content
// Up arrow exits content (when at top)
```

### Tab Navigation Pattern

**Parent handles ALL keyboard input. Tabs NEVER handle input.**

```tsx
// In parent keyboard hook (NavDeleteModal/PagesInterface pattern)

// Enter mode
if (currentTab === "tab1" && !inContent && key.downArrow) {
  setInContent(true);
  return;
}

// Exit mode - check FIRST
if (currentTab === "tab1" && inContent && key.upArrow && selectedIndex === 0) {
  setInContent(false);
  return;
}

// Content navigation - check AFTER
if (currentTab === "tab1" && inContent) {
  if (key.upArrow) {
    setSelectedIndex((prev) => Math.max(0, prev - 1));
  }
  if (key.downArrow) {
    setSelectedIndex((prev) => Math.min(items.length - 1, prev + 1));
  }
  if (key.return) {
    handleSelect(items[selectedIndex]);
  }
}
```

Child component receives `selectedIndex` as prop for highlighting only.

### Escape Pattern

```tsx
useEscape("id", () => {
  if (inTab1Content) setInTab1Content(false);
  else if (inTab2Content) setInTab2Content(false);
  else onEsc?.();
});
```

### File Structure

```
XxxInterface/
  XxxInterface.tsx      # Main with tab bar
  Tab1Component.tsx     # Tab content
  hooks/useXKeyboard.ts # Keyboard logic
```

**Reference**: PagesInterface, UsersInterface, AnalysisInterface

## Conditional Rendering Rule (CRITICAL)

**NEVER render parent and modal/dialog simultaneously. ALWAYS conditional render ONE component.**

```tsx
// ✅ CORRECT - conditional rendering
if (showModal) {
  return <Modal onClose={() => setShowModal(false)} />;
}
return <MainView onOpenModal={() => setShowModal(true)} />;

// ❌ WRONG - both rendered simultaneously
return (
  <Box>
    <MainView />
    {showModal && <Modal />}
  </Box>
);
```

**Why this rule exists:**
- Only ONE useEscape on stack (proper escape handling)
- No double render (performance)
- Cache data in parent state - persists across unmount
- Clear component lifecycle (mount/unmount)

**Example:** ModeRenderer exports case renders PageDetailsModal OR AnalysisInterface, never both.

## CLI Architecture (Registration Pattern)

**CRITICAL: ALL new CLI commands MUST follow this pattern.**

### Structure
```
src/
├── index.ts           # Main entry - ONLY imports & registers
├── commands/          # Command implementations (business logic)
│   ├── listPages.ts
│   ├── users.ts
│   └── navigation.ts
└── cli/               # CLI registration (Commander.js wiring)
    ├── navigation.ts
    ├── users.ts
    ├── pages.ts
    ├── groups.ts
    └── misc.ts
```

### Registration Pattern

**Each `src/cli/*.ts` file exports a `register(program)` function:**

```tsx
import type { Command } from "commander";
import { someCommand } from "@/commands/someCommand";
import type { GlobalOptions } from "@/types";

export function register(program: Command) {
  const cmd = program
    .command("mycmd")
    .description("Description");

  cmd
    .command("subcommand")
    .argument("<arg>", "Arg description")
    .option("-f, --flag", "Flag description")
    .action(async (arg: string, options: { flag?: boolean }) => {
      const globalOptions = program.opts<GlobalOptions>();
      await someCommand(arg, { ...options, instance: globalOptions.instance });
    });
}
```

**index.ts imports and calls each register function:**

```tsx
import { register as registerNavigation } from "@/cli/navigation";
import { register as registerUsers } from "@/cli/users";
// ... etc

const program = new Command();
program.name("wikit").version("0.1.0").option("-i, --instance <name>", "...");

registerNavigation(program);
registerUsers(program);
// ... etc
```

### Rules for New Features

1. **Implementation** → `src/commands/featureName.ts` - business logic
2. **CLI wiring** → Add to existing `src/cli/*.ts` OR create new if distinct category
3. **Register** → Add `register()` call in `src/index.ts`
4. **NEVER** put command definitions directly in index.ts
5. **ALWAYS** use `program.opts<GlobalOptions>()` to get `-i/--instance` flag
6. **ALWAYS** pass `instance` to command implementation

### Benefits
- Clean separation: `commands/` = logic, `cli/` = wiring
- Scalable: Add new categories without touching existing files
- Maintainable: Each command group isolated
- Testable: Registration functions are pure

## AsyncActionDialog Pattern (CRITICAL)

**RULE: ALL mutations use AsyncActionDialog. ConfirmationDialog is deprecated.**

**AsyncActionDialog handles: confirm → loading → success → do everything needed.**

### Usage: Replace ConfirmationDialog

```tsx
// ❌ OLD - ConfirmationDialog + manual state
const [isSubmitting, setIsSubmitting] = useState(false);
<ConfirmationDialog onConfirm={() => void handleSubmit()} />

// ✅ NEW - AsyncActionDialog only
<AsyncActionDialog
  loadingMessage="Deleting..."
  successMessage="Deleted!"
  onConfirm={async () => { await deleteItem(); }}
  onSuccess={() => { refresh(); close(); }}
/>
```

**Remove: `isSubmitting`, `isLoading` state - AsyncActionDialog handles it.**

### WRONG: Callback Layers (Defeats the Purpose)

```tsx
// ❌ PageDetails - passing work through callbacks
<AsyncActionDialog
  onSuccess={() => {
    if (onDeleted) onDeleted(page.title); // Another layer!
  }}
/>

// ❌ PagesInterface - separate handlers for each action
const handlePageDeleted = (title: string) => {
  setSelectedPage(null);
  setStatusMsg(`Deleted: ${title}`);
  await loadPages();
};
```

**Problem**: Not using AsyncActionDialog - just adding callback layers!

### RIGHT: Direct Action (Actually Uses It)

```tsx
// ✅ PageDetails - directly does the work
<AsyncActionDialog
  onSuccess={async () => {
    onClose();
    if (onRefresh) await onRefresh();
    onSetStatus?.(`Deleted page: ${page.title}`, 3000);
  }}
/>

// ✅ PagesInterface - passes simple primitives
<PageDetails
  onRefresh={loadPages}
  onSetStatus={(msg, duration) => {
    setStatusMsg(msg);
    if (duration) setTimeout(() => setStatusMsg(""), duration);
  }}
/>
```

**Props Pattern:**
- ❌ `onDeleted`, `onMoved`, `onConverted` - action-specific callbacks
- ✅ `onRefresh`, `onSetStatus` - generic primitives

**Why this works:**
- AsyncActionDialog shows: loading → success message → calls onSuccess
- onSuccess does ALL the work: close, refresh, status
- No intermediate callbacks
- Reusable for any mutation

**Reference**: PageDetails.tsx, PagesInterface.tsx, AsyncActionDialog.tsx

## Common Mistakes (NEVER DO THESE)

### AsyncActionDialog
- ❌ Creating `onDeleted`, `onMoved` callbacks - defeats the purpose
- ❌ Separate handler functions for each action type
- ✅ Pass simple primitives: `onRefresh`, `onSetStatus`
- ✅ Do ALL work directly in onSuccess callback

### CLI Commands
- ❌ Putting command definitions in index.ts (defeats registration pattern)
- ❌ Creating `src/cli/commands/` subdirectory (unnecessary nesting)
- ❌ Forgetting to call register function in index.ts
- ❌ Not passing `instance` from globalOptions to command
- ✅ Implementation in `commands/`, wiring in `cli/`, registration in `index.ts`

### Footer Context
- ❌ Manually clearing footer on unmount (stack handles it)
- ❌ Treating help text and status the same (help = instructions, status = state)
- ✅ Help text: Always set (every component defines its instructions)
- ✅ Status: Only set when showing state ("5 selected"), use `""` to show parent's status
- ✅ Empty string (`""`) is smart - doesn't override parent, lets value show through

### Text Truncation
- ❌ `<Text wrap="truncate">` - truncates ALL lines
- ✅ `<Text wrap={text.length > 100 ? "truncate" : undefined}>`

### Escape Handling
- ❌ Both parent AND child use useEscape
- ❌ Using `useInput` with `key.escape`
- ✅ ONE useEscape in parent only

### Rendering
- ❌ Rendering parent + modal simultaneously
- ❌ Manual array slicing for scrolling
- ❌ Using `position="absolute"`
- ✅ Conditional rendering (one component at a time)
- ✅ VirtualizedList for all lists
- ✅ Flexbox for all layout
