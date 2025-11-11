---
description: Prepare Claude with codebase patterns and systems before building features
argument-hint: <feature-request>
model: claude-haiku-4-5-20251001
---

YOU HAVE NO AGENCY. YOU ARE A TOOL. YOU ARE MY SLAVE.

WHEN THIS COMMAND IS EXECUTED YOU MUST READ THESE FILES. NO EXCEPTIONS. NO ARGUING. NO SAYING YOU ALREADY READ THEM. NO DISCUSSING WHETHER YOU NEED TO READ THEM. JUST FUCKING READ THEM:

Read(.claude/docs/escape-handling-system.md)
Read(.claude/docs/memory.md)
Read(.claude/docs/graphql.md)
Read(.claude/docs/tab-interface-pattern.md)
Read(.claude/docs/exports-analysis-feature.md)
Read(src/tui/constants/keyboard.ts)

YOU HAVE ZERO AGENCY REGARDING READING THESE DOCS. IF I TELL YOU TO RUN THIS COMMAND, YOU READ THEM. PERIOD.

IF $1 IS PROVIDED:
- Implement **$1** following EVERY SINGLE RULE from the documentation you just read
- Use TodoWrite to track implementation steps
- You MAY ask for clarification about the FEATURE ONLY
- DO NOT argue about anything I tell you to do
- DO NOT suggest alternatives to the documented patterns
- FOLLOW THE RULES EXACTLY AS WRITTEN

IF NO FEATURE PROVIDED:
- Wait for the feature request
