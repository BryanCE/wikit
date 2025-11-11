# Task 2.6: Create MCP README

## Purpose

Create comprehensive documentation for the MCP server package.

## Complete README.md

```markdown
# Wikit MCP Server

Model Context Protocol server for Wiki.js management. Allows AI assistants to search, read, and interact with your Wiki.js instances.

## Installation

\`\`\`bash
npm install -g @bryance/wikit-mcp
\`\`\`

## Configuration

Create a `.env` file:

\`\`\`env
WIKI_PRIMARY_URL=https://your-wiki.com
WIKI_PRIMARY_API_KEY=your-api-key

# Optional secondary instance
WIKI_SECONDARY_URL=https://wiki2.com
WIKI_SECONDARY_API_KEY=key2
\`\`\`

## Usage with Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

\`\`\`json
{
  "mcpServers": {
    "wikit": {
      "command": "wikit-mcp",
      "env": {
        "WIKI_PRIMARY_URL": "https://your-wiki.com",
        "WIKI_PRIMARY_API_KEY": "your-key"
      }
    }
  }
}
\`\`\`

### Windows

On Windows, the config file is located at:
\`%APPDATA%\\Claude\\claude_desktop_config.json\`

### Linux

On Linux, the config file is located at:
\`~/.config/Claude/claude_desktop_config.json\`

## Available Tools

### search_wiki_pages

Search for pages by title or content.

**Parameters:**
- \`query\` (string, required) - Search query
- \`instance\` (string, optional) - "primary", "secondary", or "both" (default: "primary")

**Example:**
> "Search for pages about authentication"

### get_page_content

Get the full content of a specific wiki page.

**Parameters:**
- \`pageId\` (number, required) - The page ID
- \`instance\` (string, optional) - "primary" or "secondary" (default: "primary")

**Example:**
> "Get the content of page 123"

### list_navigation

Get the wiki navigation tree/structure.

**Parameters:**
- \`instance\` (string, optional) - "primary" or "secondary" (default: "primary")

**Example:**
> "Show me the wiki navigation structure"

### get_wiki_status

Get status information about the wiki instance.

**Parameters:**
- \`instance\` (string, optional) - "primary", "secondary", or "both" (default: "both")

**Example:**
> "What's the status of the wiki?"

## Development

### Setup

\`\`\`bash
git clone https://github.com/bryance/wikit-mcp
cd wikit-mcp
bun install
\`\`\`

### Build

\`\`\`bash
bun run build
\`\`\`

### Run Locally

\`\`\`bash
bun run dev
\`\`\`

### Testing with MCP Inspector

\`\`\`bash
npx @modelcontextprotocol/inspector dist/index.js
\`\`\`

## How It Works

This MCP server:
1. Uses [@bryance/wikit](https://npmjs.com/package/@bryance/wikit) for Wiki.js API access
2. Exposes 4 tools for AI interaction
3. Connects via stdio to Claude Desktop or other MCP clients
4. Supports multiple Wiki.js instances

## Related Projects

- [@bryance/wikit](https://npmjs.com/package/@bryance/wikit) - The underlying Wiki.js CLI/API library

## License

MIT

## Author

Dale Henderson
\`\`\`

## Key Sections Explained

### Installation
Shows how to install globally.

### Configuration
Clear .env setup instructions.

### Usage with Claude Desktop
- JSON config example
- Platform-specific paths for macOS/Windows/Linux

### Available Tools
Each tool documented with:
- Description
- Parameters
- Example usage

### Development
How to clone, build, test locally.

### How It Works
High-level overview of the architecture.

## Verification

The README should:
- [ ] Have clear installation steps
- [ ] Show .env configuration
- [ ] Include Claude Desktop setup for all platforms
- [ ] Document all 4 tools
- [ ] Include development instructions
- [ ] Link to @bryance/wikit package
- [ ] Include license and author

## Next Steps

Move to Task 2.7 to test the MCP server locally with the MCP inspector.
