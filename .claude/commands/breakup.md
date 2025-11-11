---
allowed-tools: Read, Write, Edit, Glob, Grep
description: Refactor large files by breaking them into smaller, organized pieces
argument-hint: <file-path> [output-directory]
---

Break up the file at @$1 into smaller, more maintainable pieces.

**For TSX/JSX files:**
- Identify the main/primary component that should remain
- Extract smaller helper components into separate files
- Main component imports the extracted pieces
- Each extracted component gets its own file
- Maintain proper imports and types

**For TS files:**
- Analyze the file structure (functions, types, constants, classes)
- Group related code logically
- Create individual files for each logical unit
- Determine if an index file for re-exports is needed OR if there's a main file that should import the pieces
- Preserve all type safety and imports

**Arguments:**
- `$1` (required): Absolute path to the file to break up
- `$2` (optional): Directory to place the broken-up files. If not provided, create a directory based on the original filename (e.g., `theme.ts` → `themes/` directory)

**Process:**
1. Read and analyze the target file (@$1)
2. Identify logical groupings (components, themes, utilities, types, etc.)
3. Determine the structure: main file + helpers OR index file with re-exports
4. Create the output directory ($2 if provided, otherwise infer from filename)
5. Create individual files for each logical unit
6. Update the main file to import extracted pieces OR create an index file for re-exports
7. Verify imports are correct and nothing is lost

**Output:**
Provide a summary of files created and any manual steps needed.
