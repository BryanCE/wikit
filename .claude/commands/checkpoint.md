---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
description: Create a git commit as a checkpoint before big changes
model: claude-haiku-4-5-20251001
---

## Context

- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff HEAD`
- Current branch: !`git branch --show-current`
- Recent commits: !`git log --oneline -10`

## Your task

Based on the above changes and context from our recent chat, create a single git commit. You may use my git aliases of `git cmt "message"` which will add all files and then commit with your message.

**IMPORTANT**: Create a clean commit message without any attribution footers. Do NOT add "Generated with Claude Code" or "Co-Authored-By" lines.
