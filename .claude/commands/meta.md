---
description: Generate a new slash command
argument-hint: <command-name> <goal-description> [verbosity] [model]
allowed-tools: Write, Read, Glob
---

# Meta: Slash Command Generator

You are creating a new slash command for Claude Code.

## Command Details

- **Command Name**: `$1` (will be saved as `.claude/commands/$1.md`)
- **Goal/Purpose**: $2
- **Verbosity Level**: ${3:-normal} (options: concise, normal, verbose, detailed)
- **Model Override**: ${4:-default} (use "default" for no override, or specify: claude-3-5-haiku-20241022, claude-3-5-sonnet-20241022, etc.)

## Your Task

Create a new slash command file at `.claude/commands/$1.md` following these requirements:

### 1. Structure Requirements

```markdown
---
description: <one-line description>
argument-hint: <usage pattern like: <required> [optional]>
allowed-tools: Tool1, Tool2, Tool3
${4:+model: $4}
---

# Command Name: Purpose

<Command prompt content here>
```

**Required frontmatter:**
- `description`: One-line description of what the command does
- `argument-hint`: Show expected usage (e.g., `<file-path>`, `[optional-arg]`, `<files...>`)
- `allowed-tools`: Comma-separated list of tools this command needs (Read, Edit, Write, Bash, Glob, Grep, etc.)
- `model`: (optional) Specify model override if needed

### 2. Verbosity Guidelines

**Concise**: Minimal prompt, direct instructions only, no examples
**Normal**: Standard prompt with key instructions and 1-2 examples
**Verbose**: Detailed prompt with multiple examples and context
**Detailed**: Comprehensive prompt with extensive examples, edge cases, and documentation

### 3. Best Practices for the Command

- Use `$ARGUMENTS` to capture all arguments, or `$1`, `$2`, etc. for positional args
- Use exclamation mark prefix for bash command execution (example: `!git status`)
- Use `@` prefix for file references: `@[file](path/to/file.md)`
- Include helpful context and examples appropriate to verbosity level
- Structure the prompt to be clear and actionable
- Consider what tools might be needed (can specify in frontmatter with `allowed-tools`)

### 4. Argument Handling

Based on the goal, determine:
- What arguments does this command need?
- Should it use `$ARGUMENTS` (all args) or `$1, $2, $3` (positional)?
- What's a good `argument-hint` that shows users the expected format?

**Argument syntax:**
- `$ARGUMENTS` - All arguments passed (use for variable number of files/items)
- `$1`, `$2`, `$3` - Specific positional arguments
- `@$ARGUMENTS` - Read all files passed as arguments
- `@$1` - Read specific file from first argument
- `!command` - Execute bash command and include output

### 5. Tool Selection

Analyze the goal and determine which tools are needed:
- **Read**: Reading files, analyzing code
- **Edit**: Modifying existing files
- **Write**: Creating new files
- **Bash**: Running git commands, build tools, terminal operations
- **Glob**: Finding files by pattern
- **Grep**: Searching file contents
- **TodoWrite**: Creating task lists

**Examples:**
- Documentation consolidation: `Read, Edit`
- Creating new files: `Read, Write, Glob`
- Git operations: `Bash(git add:*), Bash(git status:*), Bash(git commit:*)`
- Analysis tasks: `Read, Grep, Glob`

### 6. Common Patterns

**For commands that read files**:
```markdown
Read the following file: @$1
```

**For commands that execute bash**:
```markdown
Current status: !(backtick)git status --short(backtick)
```

**For commands with multiple args**:
```markdown
Task: $1
Context: $2
Requirements: $3
```

## Pre-Generation Checklist

Before creating the command file, verify:
- [ ] Determined correct argument syntax ($ARGUMENTS vs $1, $2, etc.)
- [ ] Identified all necessary tools for allowed-tools
- [ ] Created appropriate argument-hint for users
- [ ] Planned command structure and instructions
- [ ] Considered verbosity level: ${3:-normal}

## Output Requirements

Create the command file at `.claude/commands/$1.md` with:

1. **Complete frontmatter** including:
   - `description` (one-line)
   - `argument-hint` (usage pattern)
   - `allowed-tools` (comma-separated list)
   - `model` (if $4 is not "default")

2. **Proper argument handling**:
   - Use `$ARGUMENTS` for multiple/variable args
   - Use `$1, $2, $3` for specific positional args
   - Use `@$ARGUMENTS` or `@$1` to read files

3. **Appropriate verbosity**: ${3:-normal}

4. **Clear instructions** for what the command should do

After creating the file, provide:
1. Summary of the command
2. Example usage
3. File path where saved
4. List of tools specified in allowed-tools
