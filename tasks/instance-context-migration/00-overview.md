# Instance Context Migration - Overview

## Goal
Remove instance prop drilling by implementing a global InstanceContext singleton, matching the pattern used in the dev branch.

## Benefits
- Eliminates passing `instance` prop through every component
- Cleaner component interfaces
- Centralized instance management
- Easier to maintain and refactor

## Execution Order

Execute tasks in this order:
1. `01-create-instance-context.md` - Create the singleton
2. `02-update-core-graphql.md` - Update main graphql function
3. `03-update-api-modules.md` - Update all API module functions
4. `04-update-app-content.md` - Set instance in context
5. `05-update-cli-commands.md` - Update CLI to use context
6. `06-update-interface-components.md` - Update main interface components
7. `07-update-child-components.md` - Update all child components
8. `08-update-mode-renderer.md` - Remove props from ModeRenderer
9. `09-update-types.md` - Clean up type definitions
10. `10-final-verification.md` - Test and verify

## Current State

**Branch**: main
**Status**: ✅ 100% Complete
**Tasks Completed**: All tasks 1-10
**Hardcoded Instances**: All removed

## Reference Implementation

The dev branch at https://github.com/bryanils/wikit.git has the complete implementation.

Key files to reference:
- `src/contexts/InstanceContext.ts` - The singleton
- `src/api.ts` - Updated graphql function
- `src/tui/AppContent.tsx` - Setting instance in context
