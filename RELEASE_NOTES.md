# 🚀 Wikit v0.1.0 - Initial Release

Full-featured CLI and TUI toolkit for managing Wiki.js instances. Control pages, navigation, users, groups, and more through an interactive terminal interface or command-line operations.

## ✨ Features

### 📄 Page Management
- Browse and search all pages with virtualized scrolling
- View detailed page information (content, metadata, tags)
- Edit page properties and content
- Move pages to different paths
- Convert between editor types (markdown/code)
- Bulk delete operations
- Export pages to JSON

### 🧭 Navigation Management
- View and manage navigation tree structure
- Add new items (links, headers, dividers)
- Edit existing navigation items
- Move items with visual placement picker
- Bulk delete navigation items
- Import/export navigation configurations

### 👥 User Management
- List all Wiki.js users
- Create new users with group assignments
- Edit user details and passwords
- Manage user group memberships
- Delete users with confirmation
- Import/export user profiles

### 👨‍👩‍👧‍👦 Group Management
- View all groups and their members
- Create new groups with permissions
- Manage group membership (add/remove users)
- View and edit group permissions
- Configure page access rules
- Find orphaned users (not in any group)

### 📊 Analysis & Comparison
- Analyze page structure and relationships
- Find orphaned pages (no navigation links)
- Compare navigation between instances
- Compare page content and metadata
- Export analysis results

### 🔄 Multi-Instance Support
- Manage multiple Wiki.js instances
- Encrypted configuration storage
- Easy instance switching
- Sync configurations between instances
- Compare settings across instances

### 🎨 Interactive TUI
- Multiple color themes (Dracula, Tokyo Night, Monokai, and more)
- Consistent keyboard navigation patterns
- Real-time search and filtering
- Context-aware help system
- Visual confirmation dialogs
- Nerd Font icon support

## 📦 Installation

### Install Globally (CLI Tool)
```bash
npm install -g @bryance/wikit
```

### Install as Library
```bash
npm install @bryance/wikit
```

## 🚀 Quick Start

### Launch Interactive TUI
```bash
wikit tui
```

### First-Time Setup
When you run Wikit for the first time, the setup wizard will guide you through configuring your first Wiki.js instance:
- Instance ID (e.g., 'mywiki')
- Display name
- Wiki.js API URL (e.g., 'https://your-wiki.com/graphql')
- API key

Your credentials are stored encrypted in `~/.config/wikit/config.json`

### CLI Commands
```bash
# List pages
wikit pages list

# Manage navigation
wikit nav

# Manage users
wikit users

# Manage groups
wikit groups

# View configuration
wikit config --list

# Get help
wikit --help
```

## 📚 Documentation

- **Full README**: [View on GitHub](https://github.com/BryanCE/wikit#readme)
- **npm Package**: [@bryance/wikit](https://www.npmjs.com/package/@bryance/wikit)

## 🎯 Use Cases

- **Wiki Administration**: Manage users, groups, and permissions
- **Content Management**: Bulk operations on pages and navigation
- **Multi-Environment**: Sync configurations between dev/staging/prod
- **Content Analysis**: Find orphaned pages and broken navigation
- **Automation**: Use as a library in your Node.js scripts

## 🔧 Requirements

- Node.js 18+ or Bun runtime
- Wiki.js instance with API access enabled
- API key with appropriate permissions

## 💻 Programmatic Usage

Wikit can also be used as a library in your Node.js projects:

```typescript
import { listPages, syncPages } from '@bryance/wikit/commands';
import type { Page } from '@bryance/wikit/types';

// Use commands programmatically
const pages = await listPages({ instance: 'primary' });
```

Available exports:
- `@bryance/wikit/commands` - Command functions
- `@bryance/wikit/api` - GraphQL API layer
- `@bryance/wikit/types` - TypeScript types
- `@bryance/wikit/utils` - Utility functions
- `@bryance/wikit/config` - Configuration management

## 🎨 Themes

Wikit includes multiple color themes:
- Dracula
- Tokyo Night
- Monokai
- Synthwave
- Duskfox
- Horizon
- Scarlet Protocol
- ILS Theme

Switch themes with `/theme` in TUI mode or via config.

## ⌨️ Keyboard Navigation

Consistent patterns across all interfaces:
- **↑↓** - Navigate lists and menus
- **→←** - Expand/collapse trees or navigate buttons
- **Enter** - Confirm/select/submit
- **Space** - Toggle selections
- **Esc** - Go back/cancel

## 📄 License

This software is released under a custom commercial license. See [LICENSE](https://github.com/BryanCE/wikit/blob/main/LICENSE) for details.

**Free use for:**
- Personal/non-commercial use
- Businesses with revenue under $500k/year
- Non-profit organizations

**Commercial license required for:**
- Businesses with revenue over $500k/year
- Educational institutions (institutional use)

## 🐛 Issues & Feedback

Found a bug or have a feature request? Please [open an issue](https://github.com/BryanCE/wikit/issues) on GitHub.

## 🙏 Acknowledgments

Built with:
- [Ink](https://github.com/vadimdemedes/ink) - React for interactive CLIs
- [Commander.js](https://github.com/tj/commander.js) - CLI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Bun](https://bun.sh/) - Fast JavaScript runtime

---

**Full Changelog**: https://github.com/BryanCE/wikit/commits/v0.1.0
