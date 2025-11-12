# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Install dependencies**: `bun install`
- **Development**: `bun run dev` (runs src/index.ts directly)
- **Build**: `bun run build` (outputs to dist/ directory)
- **Type checking**: `bun run typecheck`
- **Linting**: `bun run lint`
- **Production**: `bun run start` (runs built version from dist/)

## Project Architecture

This is a **CLI and TUI tool for Wiki.js API management** built with TypeScript, React (via Ink), and Bun. The project supports managing multiple Wiki.js instances.

### Core Structure

- **Entry point**: `src/index.ts` - Commander.js CLI with commands: `list`, `delete`, `tui`
- **API layer**: `src/api.ts` - GraphQL client wrapper with typed responses
- **Configuration**: `src/config.ts` - Multi-instance Wiki.js config management
- **Commands**: `src/commands/` - Individual CLI command implementations
- **TUI**: `src/tui/` - React/Ink-based terminal user interface

### Multi-Instance Support

The application supports multiple Wiki.js instances configured via the dynamic config system (see Config setup in TUI) or via environment variables for legacy support.

Instances can be switched using the `-i/--instance` flag in CLI mode or the `i` command in TUI mode.

### Instance Management

The application uses a global `InstanceContext` singleton to manage the current Wiki.js instance:

**How It Works:**
- **CLI Mode**: A preAction hook in `src/index.ts` sets the instance before any command runs
- **TUI Mode**: `AppContent` syncs the instance state with the context via useEffect
- **API Layer**: The `graphql()` function automatically uses `InstanceContext.getInstance()`

**Key Files:**
- `src/contexts/InstanceContext.ts` - Singleton implementation
- `src/index.ts` - PreAction hook for CLI
- `src/tui/AppContent.tsx` - Instance syncing for TUI
- `src/api.ts` - Context-aware GraphQL client

**Benefits:**
- Eliminates instance prop drilling through 69+ component files
- Cleaner function signatures (no instance parameters)
- Centralized instance management
- Consistent pattern for both CLI and TUI modes

**For Commands That Switch Instances:**
Some commands (`sync.ts`, `status.ts`, `compare.ts`) need to switch between instances internally. They use `InstanceContext.setInstance()` directly to manage multi-instance operations.

### TUI Architecture

The TUI uses React with Ink for terminal rendering:

- **App modes**: Command input, page browsing, search, delete, help
- **Components**: Modular React components in `src/tui/components/`
- **State management**: Local React state with mode-based rendering
- **Navigation**: ESC key for back navigation, mode switching via commands

#### Keyboard Navigation Standards

The TUI follows a consistent keyboard navigation philosophy for better UX:

**Core Principles:**

- Arrow keys for navigation (↑↓ for lists, →← for trees)
- Space for selection/deselection (toggle) everywhere
- Enter for submit/confirm/action everywhere
- Escape for back/cancel everywhere
- Avoid letter key shortcuts - use menus instead

**Standard Patterns:**

- **Lists**: ↑↓ to navigate, Enter to select, Esc to go back
- **Multi-select**: ↑↓ to navigate, Space to toggle, Enter to confirm, Esc to go back
- **Trees**: ↑↓ to navigate, → to expand, ← to collapse, Enter to select, Esc to go back
- **Menus/Dialogs**: ↑↓ to navigate, Enter to select, Esc to cancel

**Implementation:**

- Use constants from `src/tui/constants/keyboard.ts`
- Use `COMMON_HELP_PATTERNS` for standard help text
- Use `formatHelpText()` for custom combinations
- Help text format: "action1 • action2 • action3" (bullet separators)

### GraphQL Integration

All Wiki.js API interactions use GraphQL:

- Centralized `graphql()` function with error handling
- Type-safe query/mutation execution
- Bearer token authentication per instance

### Key Features

- **Page listing**: Browse/search Wiki.js pages with filtering
- **Bulk operations**: Delete multiple pages by prefix
- **Interactive TUI**: Full-featured terminal interface
- **Multi-instance**: Switch between different Wiki.js instances
- **Path-based filtering**: Support for recursive and non-recursive page queries

## Environment Setup

Create a `.env` file with the required API keys and URLs for your Wiki.js instances. See the existing `.env` file for the expected format.

## TypeScript Configuration

- Uses path mapping with `@/*` pointing to `src/*`
- Strict TypeScript settings enabled
- React JSX support for Ink components
- Bundler module resolution for Bun compatibility
- Never use TypeScript `any` type - always use proper types
- ONLY I RUN BUN COMMANDS FOR DEV SERVERS FOR LINTING FOR EVERYTHING!!! YOU ARE NOT ALLOWED TO TYPECHECK, LINT, RUN SERVERS, OR ANYTHING LIKE THAT!!!
- it's 2025
- Quit putting emojis in everything
- We use ?? instead of || wherever possible as well ass optional chaining using ?
- Prefer using nullish coalescing operator (`??=`) instead of an assignment expression, as it is simpler to read @typescript-eslint/prefer-nullish-coalescing
- Use VirtualizedList do not manually calculate height of things or handle scrolling outside of this unless absolutely needed
- **CRITICAL**: HeaderContext uses a STACK (like EscapeContext) - any component can call useHeaderData, previous values restore automatically on unmount. DO NOT manually manage headers. (see .claude/docs/memory.md)
- using single letter commands is against the rules of this project in every way possible if you do it you will die