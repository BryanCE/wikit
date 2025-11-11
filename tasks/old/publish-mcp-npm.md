# Task 2.8: Publish MCP to npm

## Purpose

Publish the MCP server to npm as `@bryance/wikit-mcp` so users can install and use it.

## Prerequisites

- [ ] All tests pass (Task 2.7)
- [ ] Build succeeds with no errors
- [ ] README is complete
- [ ] package.json has correct metadata
- [ ] You're logged into npm

## Steps

### 1. Final Verification

Before publishing, verify everything is ready:

```bash
# Clean and rebuild
rm -rf dist
bun run build

# Check package.json
cat package.json | grep -E "name|version|main|bin"
```

Verify:
- Name: `@bryance/wikit-mcp`
- Version: `0.1.0` (or your chosen version)
- Main: `./dist/index.js`
- Bin: `wikit-mcp` pointing to `./dist/index.js`

### 2. Test Package Contents

Run a dry-run to see what will be published:

```bash
npm publish --dry-run
```

Check the output shows:
- ✅ `dist/` directory
- ✅ `README.md`
- ✅ `package.json`
- ❌ `src/` directory (should NOT be included)
- ❌ `.env` file (should NOT be included)
- ❌ `node_modules/` (should NOT be included)

### 3. Login to npm

If not already logged in:

```bash
npm login
```

Verify login:
```bash
npm whoami
```

### 4. Publish Package

```bash
npm publish --access public
```

Use `--access public` because this is a scoped package.

### 5. Verify Publication

Check the package is live:

```bash
npm view @bryance/wikit-mcp
```

Should show:
- Package name and version
- Description
- Dependencies (including @bryance/wikit)
- Repository URL

### 6. Test Installation

Test installing your package globally:

```bash
# Install globally
npm install -g @bryance/wikit-mcp

# Verify command is available
which wikit-mcp

# Test running (will need .env configured)
wikit-mcp
```

Should see: "Wikit MCP server running on stdio"

### 7. Test with Claude Desktop

Update your Claude Desktop config:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
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
```

Restart Claude Desktop and verify:
- [ ] MCP server connects
- [ ] Tools are available in Claude
- [ ] You can use the tools in conversation

### 8. Update Package Page

Visit https://npmjs.com/package/@bryance/wikit-mcp

Verify:
- [ ] README displays correctly
- [ ] Version is correct
- [ ] Dependencies show correctly
- [ ] Repository link works

### 9. Create GitHub Release

Tag the version in git:

```bash
git tag v0.1.0
git push origin v0.1.0
```

Create a release on GitHub:
- Go to https://github.com/bryance/wikit-mcp/releases
- Click "Create a new release"
- Select tag `v0.1.0`
- Title: "v0.1.0 - Initial Release"
- Description: Brief summary of features

## Version Management

For future updates:

```bash
# Bump patch version (0.1.0 -> 0.1.1)
npm version patch

# Bump minor version (0.1.0 -> 0.2.0)
npm version minor

# Bump major version (0.1.0 -> 1.0.0)
npm version major

# Then publish
npm publish
```

## Troubleshooting

### Package Name Already Taken
- Check if you own the @bryance scope
- Try a different name or scope

### Permission Denied
- Verify you're logged in: `npm whoami`
- Check you have publish rights to @bryance scope

### Missing Dependencies in Published Package
- Check `dependencies` in package.json
- Ensure @bryance/wikit version is correct

### Command Not Found After Install
- Check `bin` field in package.json
- Verify dist/index.js has shebang: `#!/usr/bin/env node`
- Check file permissions: `chmod +x dist/index.js`

## Verification Checklist

- [ ] Dry-run shows correct files
- [ ] Package published successfully
- [ ] Package visible on npmjs.com
- [ ] Global install works
- [ ] Command `wikit-mcp` is available
- [ ] Server starts successfully
- [ ] Works with Claude Desktop
- [ ] GitHub release created

## Success!

You have successfully:
1. Published `@bryance/wikit` as a reusable library
2. Published `@bryance/wikit-mcp` as an MCP server
3. Made Wiki.js accessible to AI assistants

Users can now:
- Install the CLI: `npm install -g @bryance/wikit`
- Use as a library: `import { listPages } from '@bryance/wikit/commands'`
- Use with Claude Desktop: Add `@bryance/wikit-mcp` to config

## Next Steps

- Monitor npm downloads and usage
- Address any issues users report
- Add more tools to the MCP server
- Enhance the wikit CLI with new commands
