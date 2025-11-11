---
allowed-tools: Glob, Grep, LS, Read, Edit
description: Enforce linting rules on specified files using eslint.config.js rules
argument-hint: [File paths]
---

Fix all linting violations in @$ARGUMENTS according to the rules defined in eslint.config.js.

Key rules to enforce:
- Use type imports with inline-type-imports style (@typescript-eslint/consistent-type-imports)
- Remove unused variables (prefix with _ if needed) (@typescript-eslint/no-unused-vars)
- Prefer nullish coalescing (??) over logical OR (||) (@typescript-eslint/prefer-nullish-coalescing)
- Remove React imports in JSX files (react/react-in-jsx-scope)

Read each file, identify violations, and fix them using the Edit tool. Do not run any commands or dev servers.
