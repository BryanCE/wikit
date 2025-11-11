# Task 4: Update AppContent to Set Instance

## Objective
Add effect to sync currentInstance state with InstanceContext so all components can access it.

## Files to Modify
- `src/tui/AppContent.tsx`

## Changes Required

### 1. Add Import
```typescript
import { InstanceContext } from "@/contexts/InstanceContext";
```

### 2. Add useEffect Hook

Add this after the state declarations in the `AppContent` component:

```typescript
// Update global InstanceContext whenever currentInstance changes
useEffect(() => {
  InstanceContext.setInstance(currentInstance);
}, [currentInstance]);
```

### Placement
Place this effect early in the component, right after:
```typescript
const [currentInstance, setCurrentInstance] = useState<string | null>(
  initialInstance ?? null
);
```

## Full Context

```typescript
export function AppContent({ instance: initialInstance }: AppProps) {
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.COMMAND);
  const [currentInstance, setCurrentInstance] = useState<string | null>(
    initialInstance ?? null
  );
  const [checkingSetup, setCheckingSetup] = useState(true);

  // Update global InstanceContext whenever currentInstance changes
  useEffect(() => {
    InstanceContext.setInstance(currentInstance);
  }, [currentInstance]);

  // ... rest of component
}
```

## Checklist

- [x] Add import for InstanceContext
- [x] Add useEffect to sync currentInstance with context
- [x] Verify placement is correct (after state, before other effects)
- [x] TypeScript compiles without errors

## Verification

```bash
# Should compile without errors
bun run typecheck
```

## Testing

After this change:
1. The instance will be set globally when the app starts
2. Changing instance with `i` command will update the global context
3. All API calls will use the current instance automatically

## Next Task
`05-update-cli-commands.md`
