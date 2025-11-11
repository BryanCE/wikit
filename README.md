# Wikit

CLI and TUI for managing Wiki.js instances.

## Features

- **Multi-instance support**: Manage multiple Wiki.js instances
- **CLI commands**: Direct command-line operations
- **Interactive TUI**: Full-featured terminal user interface
- **Bulk operations**: Delete, compare, and sync pages in bulk
- **Page management**: Browse, search, and manage wiki pages
- **Configuration sync**: Compare and synchronize configurations between instances

## Installation

### As CLI Tool

```bash
npm install -g @bryance/wikit
wikit --help
```

### As Library (for MCP or other tools)

```bash
npm install @bryance/wikit
```

## Programmatic Usage

### Import Commands

```typescript
import { listPages, syncPages, getStatus } from '@bryance/wikit/commands';
import { WikiConfig } from '@bryance/wikit/types';

const config: WikiConfig = {
  // your config
};

const pages = await listPages({ instance: 'primary' });
```

### Import API Layer

```typescript
import { createClient, pagesQuery } from '@bryance/wikit/api';
```

### Import Types Only

```typescript
import type { Page, User, NavigationItem } from '@bryance/wikit/types';
```

## Available Exports

- `@bryance/wikit` - Main CLI entry
- `@bryance/wikit/commands` - All command functions
- `@bryance/wikit/api` - GraphQL API layer
- `@bryance/wikit/types` - TypeScript types
- `@bryance/wikit/utils` - Utility functions
- `@bryance/wikit/config` - Configuration management

## Configuration

### First-Time Setup

When you run Wikit for the first time, the built-in setup wizard will guide you through configuring your first Wiki.js instance:

```bash
wikit tui
```

The wizard will prompt you for:
- Instance ID (e.g., 'mywiki')
- Display name
- Wiki.js API URL (e.g., 'https://your-wiki.com/graphql')
- API key

Your credentials are stored encrypted in `~/.config/wikit/config.json` on Linux/macOS or `C:\Users\<User>\.config\wikit\config.json` on Windows.

### Getting Wiki.js API Keys

1. Log into your Wiki.js admin panel
2. Go to **Administration** → **API Access**
3. Create a new API key with appropriate permissions
4. Copy the generated key when prompted by the setup wizard

### Managing Multiple Instances

Add additional Wiki.js instances using:

```bash
wikit config --add
```

List all configured instances:

```bash
wikit config --list
```

Switch between instances using the `-i/--instance` flag:

```bash
wikit -i mywiki list /en/docs
```

### Legacy .env Configuration (Optional)

For backwards compatibility, you can still use a `.env` file in the project root:

```env
# First instance
WIKI1_API_URL=https://wiki1.example.com/graphql
WIKI1_API_KEY=your-api-key-here

# Second instance (optional)
WIKI2_API_URL=https://wiki2.example.com/graphql
WIKI2_API_KEY=your-api-key-here
```

The encrypted configuration is recommended as it's more secure and supports unlimited instances.

## CLI Usage

### Commands

### Global Options

- `-i, --instance <name>`: Specify Wiki instance

### List Pages

List pages under a specific path prefix:

```bash
wikit list <prefix> [options]

# Examples
wikit list /en/docs                    # List pages under /en/docs
wikit list /en/docs --recursive        # Include nested pages
wikit list /en/docs --limit 50         # Limit to 50 results
wikit list /en/docs --all              # Show all pages if no matches
wikit -i wiki2 list /en/guides         # Use different instance
```

**Options:**
- `-l, --limit <number>`: Limit number of results (0 = all, default: 0)
- `--all`: Show all pages if no matches found
- `-r, --recursive`: Include nested pages (default: only direct children)

### Delete Pages

Delete pages under a specific path prefix:

```bash
wikit delete <prefix> [options]

# Examples
wikit delete /en/old-docs              # Delete with confirmation
wikit delete /en/temp --force          # Skip confirmation prompt
```

**Options:**
- `-f, --force`: Skip confirmation prompt

### Compare Instances

Compare configurations and content between instances:

```bash
wikit compare [options]

# Examples
wikit compare --config                 # Compare site configuration
wikit compare --theme --assets         # Compare theme and assets
wikit compare --pages --details        # Compare pages with details
wikit compare --all                    # Compare everything
wikit compare --page-prefix /en/docs   # Compare specific page prefix
wikit compare --from wiki1 --to wiki2  # Specify instances
```

**Options:**
- `--from <instance>`: Source instance
- `--to <instance>`: Target instance
- `--config`: Compare site configuration
- `--theme`: Compare theme configuration
- `--assets`: Compare asset configuration
- `--pages`: Compare page summaries
- `--users`: Compare user summaries
- `--system`: Compare system information
- `--all`: Compare all configurations
- `--details`: Show detailed comparison
- `--page-prefix <prefix>`: Compare pages under specific prefix

### Instance Status

Show status and differences between instances:

```bash
wikit status [options]

# Examples
wikit status                           # Basic status comparison
wikit status --verbose                 # Detailed status information
wikit status --from wiki1 --to wiki2   # Specify instances
```

**Options:**
- `--from <instance>`: First instance
- `--to <instance>`: Second instance
- `--verbose`: Show verbose output

### Sync Instances

Synchronize configurations between instances:

```bash
wikit sync [options]

# Examples
wikit sync --config                    # Sync site configuration
wikit sync --theme --assets            # Sync theme and assets
wikit sync --pages                     # Sync all pages
wikit sync --pages --page-prefix /en/docs # Sync specific pages
wikit sync --all --dry-run             # Preview all changes
wikit sync --config --force            # Skip confirmation
```

**Options:**
- `--from <instance>`: Source instance
- `--to <instance>`: Target instance
- `--config`: Sync site configuration
- `--theme`: Sync theme configuration
- `--assets`: Sync asset configuration
- `--pages`: Sync pages content
- `--page-prefix <prefix>`: Only sync pages with this path prefix
- `--all`: Sync all configurations and pages
- `--dry-run`: Show what would be synced without making changes
- `--force`: Skip confirmation prompt

### Interactive TUI

Launch the terminal user interface:

```bash
wikit tui

# Examples
wikit tui                              # Launch TUI with default instance
wikit -i wiki2 tui                     # Launch TUI with specific instance
```

## Terminal User Interface (TUI)

The TUI provides an interactive terminal interface with the following features:

### Navigation

- **ESC**: Go back/exit current mode
- **Enter**: Select/confirm action
- **Arrow keys**: Navigate menus and lists
- **Tab**: Switch between interface sections

### Commands

Once in TUI mode, you can use these commands:

- `pages`: Browse and manage all wiki pages
- `search [query]`: Search for pages by title or path
- `delete`: Bulk delete pages with confirmation
- `compare`: Compare pages between instances
- `copy`: Copy pages between instances
- `status`: Show instance status and info
- `sync`: Synchronize between instances
- `theme`: Switch between light/dark themes
- `i [instance]`: Switch Wiki.js instance
- `help`: Show help screen
- `exit` or `quit`: Exit TUI

### Page Browser

- Browse pages in a paginated list
- View page details (content, metadata, actions)
- Mark pages for bulk operations
- Filter and search functionality

### Interactive Features

- **Real-time search**: Type to filter results instantly
- **Bulk selection**: Mark multiple pages for operations
- **Confirmation dialogs**: Safe operations with confirmation prompts
- **Status indicators**: Visual feedback for operations
- **Theme switching**: Light/dark mode support

## Development

### Project Structure

```
src/
├── index.ts              # CLI entry point
├── api.ts                # GraphQL client wrapper
├── config.ts             # Multi-instance configuration
├── types.ts              # TypeScript type definitions
├── commands/             # CLI command implementations
│   ├── listPages.ts
│   ├── deletePages.ts
│   ├── compare.ts
│   ├── status.ts
│   └── sync.ts
└── tui/                  # Terminal UI components
    ├── App.tsx           # Main TUI application
    ├── AppContent.tsx    # TUI content and routing
    ├── theme.ts          # Theme definitions
    ├── commands.ts       # TUI command definitions
    └── components/       # React/Ink UI components
```

### Available Scripts

- `bun run dev`: Run in development mode (src/index.ts)
- `bun run build`: Build for production (outputs to dist/)
- `bun run start`: Run built version (dist/index.js)
- `bun run typecheck`: Run TypeScript type checking
- `bun run lint`: Run ESLint

### Adding New Commands

1. Create command implementation in `src/commands/`
2. Add command definition to `src/index.ts`
3. Update types in `src/types.ts`
4. Add TUI support in `src/tui/commands.ts`

### Theme Customization

Themes are defined in `src/tui/theme.ts`. The application supports:
- Light theme (Alucard color scheme)
- Dark theme (Dracula color scheme)

## Troubleshooting

### Common Issues

**API Connection Errors:**
- Verify your API URL is correct and accessible
- Ensure API key has proper permissions
- Check that GraphQL endpoint is enabled in Wiki.js

**Missing Environment Variables:**
- Ensure `.env` file is in project root
- Verify all required variables are set
- Check variable names match exactly (case-sensitive)

**Permission Errors:**
- API key must have admin privileges
- Some operations require specific permissions in Wiki.js

**TUI Display Issues:**
- Ensure terminal supports ANSI colors
- Try resizing terminal window
- Use `wikit --help` for CLI-only mode

### Getting Help

- Use `wikit --help` for CLI help
- Use `wikit tui` then type `help` for TUI help
- Check Wiki.js documentation for API configuration
- Verify GraphQL endpoint is working: `curl -X POST [your-api-url]`

## License

MIT License - see LICENSE file for details.
