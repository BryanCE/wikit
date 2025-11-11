---
description: Consolidate and reduce documentation file size while preserving essential context
argument-hint: <file-paths...>
allowed-tools: Read, Edit
---

# Documentation Consolidation

You are tasked with consolidating documentation files to reduce context bloat and token usage while maintaining correctness and essential information.

## Task

Review and edit the following documentation files: @*

## Guidelines

1. **Read First**: Carefully read each file to understand its purpose and content
2. **Assess Conciseness**: Determine if the file can be reduced without losing critical information
3. **Preserve Essentials**: Keep all information necessary for development and understanding
4. **Remove Redundancy**: Eliminate:
   - Repetitive explanations
   - Excessive examples (keep 1-2 best ones)
   - Verbose wording that can be shortened
   - Outdated or irrelevant sections

5. **Leave Well-Written Docs**: If documentation is already concise and further reduction would harm clarity, leave it unchanged

## Editing Strategy

- Use bullet points instead of paragraphs where appropriate
- Remove filler words and phrases
- Consolidate similar sections
- Keep code examples minimal but representative
- Maintain structure and formatting for readability

## Output

For each file:
1. Assess if consolidation is beneficial
2. If yes: Edit the file with improvements
3. If already concise: Skip and note why

Report summary of changes made and files left unchanged.
