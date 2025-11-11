---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
description: Analyze to make sure we aren't re-writing code and mixing up types acros the codebase.
argument-hint: [Files]
---

Analyze these files: @$ARGUMENTS and make sure they are utilizing our centralized types. If not create types under [types](../../src/types) directory.
