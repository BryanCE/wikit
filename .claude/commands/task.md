---
description: Execute and track a task from a task file
argument-hint: <task-file-path> <optional-checkist-file>
---

## Context

- Task file: @$1
- Optional Checklist File: $2
- Current git status: !`git status --short`

## Your Task

You are executing a task from a task file. Follow these rules strictly:

1. **Read and Plan**: Read the task file and break it down into a TodoWrite list
2. **Implement**: Work through each task in order, marking them as in_progress, then completed
3. **Update Progress**: As you complete tasks, mark them as done:
   - If $2 was passed in mark tasks off here, otherwise mark things off in $1
   - Maintain the original file format
4. **Generate Commit**: At the end, output a git commit command that I can manually run. Format:
   Use my git alias 'git cmt <message>' this adds all files and adds the message
   ```
   git cmt "Your message here"
   ```
   DO NOT execute the commit - just output the command for manual execution.

## Important Rules

- Use TodoWrite to track your progress
- Mark tasks completed in real-time, not all at once
- Keep the task file updated as you go
- Follow all instructions in the task file exactly
- If a task is unclear, ask before proceeding
- At the end, output ONLY the git command - no preamble

## Task File Content

The task file is located at: $1

Read it now and begin execution.
