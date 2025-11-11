# Wikit Publishing & MCP Setup - Overview

## Goal

Transform the existing `wikit` project into:
1. A publishable npm package (`@bryance/wikit`)
2. A separate MCP server package (`@bryance/wikit-mcp`) that uses the first package

## Current State

One repository with CLI, TUI, API, and commands all together.

## Target State

1. **@bryance/wikit** - Main package with:
   - CLI tool (via bin)
   - Programmatic API (via barrel exports)
   - Full TypeScript support

2. **@bryance/wikit-mcp** - Separate repo with:
   - MCP server for AI integration
   - Imports from @bryance/wikit
   - Claude Desktop compatible

## Key Principles

- **No code splitting** - Keep all code in wikit repo
- **Barrel exports** - Expose specific modules via exports field
- **Type safety** - Generate TypeScript declarations
- **Separation** - MCP is separate repo importing from wikit

## Two Phases

### Phase 1: Wikit Publishing (Tasks 1.1-1.6)
Prepare and publish the main wikit package to npm with barrel exports.

### Phase 2: MCP Server (Tasks 2.1-2.8)
Create new repository for MCP server that imports from @bryance/wikit.

## Benefits

- Users can install as CLI: `npm install -g @bryance/wikit`
- Developers can use as library: `import { listPages } from '@bryance/wikit/commands'`
- AI can use via MCP: Add to Claude Desktop config
- All from ONE wikit codebase
