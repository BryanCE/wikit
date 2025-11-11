# Task 1: Create InstanceContext Singleton

## Objective
Create a new singleton class that manages the current Wiki.js instance globally.

## Files to Create
- `src/contexts/InstanceContext.ts`

## Implementation

Create `src/contexts/InstanceContext.ts`:

```typescript
/**
 * InstanceContext - Global singleton for managing current Wiki.js instance
 *
 * This context eliminates the need to pass instance as a parameter to every function.
 * It works for both CLI and TUI modes.
 *
 * Usage:
 * - Set instance: InstanceContext.setInstance('rmwiki')
 * - Get instance: InstanceContext.getInstance()
 * - Subscribe to changes: InstanceContext.subscribe((instance) => { ... })
 */

type InstanceListener = (instance: string | null) => void;

class InstanceContextManager {
  private currentInstance: string | null = null;
  private listeners: Set<InstanceListener> = new Set();

  /**
   * Get the current active instance
   */
  getInstance(): string | null {
    return this.currentInstance;
  }

  /**
   * Set the current active instance
   * This will notify all subscribers of the change
   */
  setInstance(instance: string | null): void {
    if (this.currentInstance !== instance) {
      this.currentInstance = instance;
      this.notifyListeners();
    }
  }

  /**
   * Subscribe to instance changes
   * Returns an unsubscribe function
   */
  subscribe(listener: InstanceListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of the current instance
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      listener(this.currentInstance);
    });
  }

  /**
   * Reset instance to null (useful for testing)
   */
  reset(): void {
    this.setInstance(null);
  }
}

// Export singleton instance
export const InstanceContext = new InstanceContextManager();
```

## Checklist

- [x] Create `src/contexts/` directory if it doesn't exist
- [x] Create `src/contexts/InstanceContext.ts` with singleton class
- [x] Export singleton instance
- [x] Verify TypeScript compiles without errors

## Verification

```bash
# Should compile without errors
bun run typecheck
```

## Next Task
`02-update-core-graphql.md`
