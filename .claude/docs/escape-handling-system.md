# Escape Handling System

## Overview

The escape handling system uses a **centralized escape context** that maintains a stack of handlers. When the escape key is pressed, only the **most recently registered handler** (top of stack) is executed.

## Core Architecture

### EscapeContext (`src/tui/contexts/EscapeContext.tsx`)

- Maintains a stack of escape handlers (`handlersRef.current`)
- Global `useInput` listener intercepts ALL escape key presses
- Calls ONLY the top handler on the stack (most recently registered)
- Components register/unregister handlers via `useEscape` hook

```typescript
// When escape is pressed:
if (key.escape) {
  const handlers = handlersRef.current;
  if (handlers.length > 0) {
    const topHandler = handlers[handlers.length - 1];
    topHandler.handler(); // Only the top handler executes
  }
}
```

### useEscape Hook

```typescript
useEscape(id: string, handler: () => void)
```

- Registers handler on mount
- Removes handler on unmount
- Handler reference should be STABLE (wrap in `useCallback` if needed)

## The Correct Pattern

### Pattern 1: Parent-Only Handling (PREFERRED)

Used when parent component manages mode/state transitions for all children.

**Example: UsersInterface, ConfigInterface**

```typescript
// PARENT COMPONENT - Uses useEscape
export function UsersInterface({ onEsc }: Props) {
  const [mode, setMode] = useState<Mode>("list");

  useEscape("users", () => {
    if (mode === "list") {
      onEsc?.(); // Exit to main menu
    } else if (mode === "detail") {
      setMode("action"); // Go back to action menu
    } else if (mode === "edit") {
      setMode("action"); // Go back to action menu
    } else if (mode === "action") {
      setMode("list"); // Go back to list
    }
    // ... handle all modes
  });

  return (
    <>
      {mode === "list" && <UserList />}
      {mode === "detail" && <UserDetail user={user} />}
      {mode === "edit" && <UserEdit user={user} />}
    </>
  );
}

// CHILD COMPONENTS - NO useEscape, NO onEsc props
export function UserDetail({ user }: Props) {
  // Just render, no escape handling
  return <Box>...</Box>;
}
```

**Key Points:**
- Parent has ONE `useEscape` hook
- Parent checks current mode and handles ALL transitions
- Children are DUMB components with NO escape handling
- Children have NO `onEsc` props

### Pattern 2: Conditional Rendering (Pages Pattern)

Used when showing modals/overlays that should hide the parent.

**Example: AppContent with PageDetailsModal**

```typescript
// APP LEVEL - No useEscape (uses function handlers)
export function AppContent() {
  const [showModal, setShowModal] = useState(false);

  const handleEscape = () => {
    if (showModal) {
      setShowModal(false);
      return;
    }
    // Handle other escape scenarios
  };

  return (
    <>
      {!showModal && <PageBrowser onEscape={handleEscape} />}
      {showModal && <PageDetailsModal onClose={() => setShowModal(false)} />}
    </>
  );
}

// COMPONENT - Uses useEscape with callback
export function PageBrowser({ onEscape }: Props) {
  useEscape("PageBrowser", () => {
    if (onEscape) {
      onEscape();
    }
  });

  return <Box>...</Box>;
}

// MODAL - Uses useEscape with callback
export function PageDetailsModal({ onClose }: Props) {
  useEscape("page-details", () => {
    onClose();
  });

  return <Box>...</Box>;
}
```

**Key Points:**
- Conditional rendering ensures ONLY ONE component uses `useEscape` at a time
- When modal shows, parent component is UNMOUNTED (not rendered)
- Each component gets its turn on the escape stack

## Mode-Based State Management

### How UsersInterface Works

```typescript
type Mode = "list" | "action" | "detail" | "edit" | "create" | "delete" | "menu" | "confirm";

useEscape("users", () => {
  // Check current mode and transition accordingly
  if (mode === "list") {
    onEsc?.(); // Exit to main menu (handled by AppContent)
  } else if (mode === "action") {
    setMode("list"); // Go back to user list
    setSelectedUser(null);
  } else if (mode === "detail") {
    setMode("action"); // Go back to action menu for this user
  } else if (mode === "edit") {
    setMode("action"); // Go back to action menu for this user
  } else if (mode === "delete") {
    setMode("action"); // Go back to action menu for this user
  } else if (mode === "create") {
    setMode("list"); // Go back to user list
  } else if (mode === "menu") {
    setMode("list"); // Go back to user list
    setMenuIndex(0);
  } else if (mode === "confirm") {
    setMode("list"); // Go back to user list
    setPendingAction(null);
  }
});
```

### Navigation Flow

```
Main Menu (AppContent)
  ↓ escape handled by AppContent.handleEscape()
  ↓
UsersInterface (mode="list")
  ↓ escape handled by UsersInterface.useEscape() → onEsc()
  ↓ Select user
  ↓
UsersInterface (mode="action") - shows UserActionMenu
  ↓ escape handled by UsersInterface.useEscape() → setMode("list")
  ↓ Select "View Details"
  ↓
UsersInterface (mode="detail") - shows UserDetailView
  ↓ escape handled by UsersInterface.useEscape() → setMode("action")
  ↓ Press escape
  ↓
Back to UsersInterface (mode="action")
```

## Common Mistakes

### ❌ WRONG: Both Parent and Child Use useEscape

```typescript
// Parent
useEscape("parent", () => {
  if (mode === "detail") {
    // This won't work! Child's handler will execute instead
    setMode("list");
  }
});

// Child
useEscape("child", () => {
  onEsc?.(); // This executes because it's on top of stack
});

// PROBLEM: Both handlers are on stack simultaneously
// Child's handler runs, parent's logic never executes
```

### ❌ WRONG: Child Has useEscape AND onEsc Prop

```typescript
// Child component
export function UserDetail({ user, onEsc }: Props) {
  useEscape("detail", () => {
    onEsc?.(); // Unnecessary - parent should handle this
  });

  return <Box>...</Box>;
}

// PROBLEM: Creates unnecessary layer in escape stack
// Parent should manage all mode transitions
```

### ❌ WRONG: Using useInput Instead of useEscape

```typescript
useInput((input, key) => {
  if (key.escape) {
    handleEscape(); // DON'T DO THIS
  }
});

// PROBLEM: Bypasses the escape stack system
// Multiple components will all handle escape simultaneously
```

### ✅ CORRECT: Parent Handles Everything

```typescript
// Parent
useEscape("parent", () => {
  if (mode === "detail") {
    setMode("action");
  } else if (mode === "action") {
    setMode("list");
  }
});

// Child
export function UserDetail({ user }: Props) {
  // No escape handling - just render
  return <Box>...</Box>;
}
```

## Implementation Checklist

When implementing escape handling for a new interface:

1. **Identify all modes/states** the interface can be in
2. **Create a mode type** (e.g., `UsersInterfaceMode`) in `src/types/`
3. **Add ONE useEscape in parent** component that handles ALL modes
4. **Map out transitions**: For each mode, where should escape take you?
5. **Remove all useEscape from children** - they should be dumb components
6. **Remove all onEsc props from children** - parent manages transitions
7. **Test the full navigation tree** with escape key

## Real-World Examples

### ConfigInterface (Perfect Example)

```typescript
export function ConfigInterface({ onEsc }: Props) {
  const [mode, setMode] = useState(ConfigMode.MENU);

  useEscape("config", () => {
    if (mode === ConfigMode.MENU) {
      onEsc(); // Exit to main menu
    } else {
      setState(prev => ({ ...prev, mode: ConfigMode.MENU }));
    }
  });

  // Render different components based on mode
  switch (mode) {
    case ConfigMode.MENU: return renderMenu();
    case ConfigMode.ADD: return <InstanceForm .../>;
    case ConfigMode.EDIT: return <InstanceForm .../>;
    // ...
  }
}

// InstanceForm does NOT use useEscape
export function InstanceForm({ onCancel }: Props) {
  // Parent ConfigInterface handles escape
  return <Box>...</Box>;
}
```

### CompareInterface (Handles Internal State)

```typescript
export function CompareInterface({ onEsc }: Props) {
  const [results, setResults] = useState(null);

  useEscape("compare", () => {
    if (results) {
      // Internal navigation: showing results → back to options
      setResults(null);
    } else {
      // Exit to main menu
      onEsc?.();
    }
  });

  return results ? <Results /> : <Options />;
}
```

## Debugging Escape Issues

If escape isn't working:

1. **Check the stack**: Add console.log to EscapeContext to see what handlers are registered
2. **Verify only ONE component uses useEscape** for a given view
3. **Check mode logic**: Ensure parent's useEscape handles ALL possible modes
4. **Look for useInput with key.escape**: These bypass the escape system
5. **Check for unstable handlers**: Handler functions recreated every render cause re-registration

## Tab Interfaces and Escape Handling

For tab-based interfaces (PagesInterface, UsersInterface, AnalysisInterface), the escape handling rule is simple:

**Only the parent interface uses `useEscape` - tabs NEVER use `useEscape`**

See [tab-interface-pattern.md](./tab-interface-pattern.md) for the complete tab interface architecture.

## Summary

- **ONE escape handler per view level** (parent component only)
- **Children are dumb** - no escape handling, no onEsc props
- **Parent manages all mode transitions** based on current state
- **Conditional rendering** ensures only relevant handler is on stack
- **Never use useInput for escape** - always use useEscape hook
- **For tab interfaces**: See [tab-interface-pattern.md](./tab-interface-pattern.md)