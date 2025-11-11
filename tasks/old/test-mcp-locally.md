# Task 2.7: Test MCP Locally

## Purpose

Test the MCP server locally to ensure it works correctly before publishing.

## Prerequisites

- [ ] All previous tasks completed (2.1-2.6)
- [ ] .env file configured with valid Wiki.js credentials
- [ ] Build succeeds with no errors

## Steps

### 1. Build the Project

```bash
bun run build
```

Verify:
- No TypeScript errors
- `dist/` directory created
- `dist/index.js` and `dist/server.js` exist

### 2. Test with MCP Inspector

The MCP Inspector is a tool for testing MCP servers:

```bash
npx @modelcontextprotocol/inspector dist/index.js
```

This will:
- Start the MCP server
- Open a web interface (usually http://localhost:5173)
- Show available tools
- Allow you to test tool calls

### 3. Verify Tools Appear

In the Inspector interface:
- [ ] See 4 tools listed:
  - `search_wiki_pages`
  - `get_page_content`
  - `list_navigation`
  - `get_wiki_status`
- [ ] Each tool shows description
- [ ] Each tool shows input schema

### 4. Test Each Tool

#### Test search_wiki_pages

In the Inspector:
1. Select `search_wiki_pages`
2. Enter parameters:
   ```json
   {
     "query": "test",
     "instance": "primary"
   }
   ```
3. Execute
4. Verify: Returns array of matching pages

#### Test get_page_content

1. Select `get_page_content`
2. Enter parameters (use a real page ID from your wiki):
   ```json
   {
     "pageId": 1,
     "instance": "primary"
   }
   ```
3. Execute
4. Verify: Returns page object with content

#### Test list_navigation

1. Select `list_navigation`
2. Enter parameters:
   ```json
   {
     "instance": "primary"
   }
   ```
3. Execute
4. Verify: Returns navigation tree structure

#### Test get_wiki_status

1. Select `get_wiki_status`
2. Enter parameters:
   ```json
   {
     "instance": "both"
   }
   ```
3. Execute
4. Verify: Returns status information

### 5. Test Error Handling

#### Test Invalid Page ID

1. Call `get_page_content` with invalid ID:
   ```json
   {
     "pageId": 999999,
     "instance": "primary"
   }
   ```
2. Verify: Returns error message (not a crash)

#### Test Invalid Instance

1. Call any tool with invalid instance:
   ```json
   {
     "instance": "nonexistent"
   }
   ```
2. Verify: Handles gracefully

### 6. Test Direct Execution

Run the server directly:

```bash
bun run dist/index.js
```

This should:
- Start the server
- Print: "Wikit MCP server running on stdio"
- Wait for stdio input (Ctrl+C to exit)

### 7. Check Logs

The server logs to stderr, so you should see:
```
Wikit MCP server running on stdio
```

Any errors will also appear in stderr.

## Troubleshooting

### "Cannot find module @bryance/wikit"
- Run `bun install` again
- Verify @bryance/wikit is in node_modules

### "GraphQL Error" or API Errors
- Check .env has correct URLs and API keys
- Test credentials work with the wikit CLI first

### Tools Not Appearing
- Check ListToolsRequestSchema handler is set
- Verify build succeeded
- Check dist/server.js was created

### Tool Execution Fails
- Check CallToolRequestSchema handler is set
- Verify imports from @bryance/wikit work
- Check error handling returns proper format

## Verification Checklist

- [ ] Build succeeds
- [ ] MCP Inspector loads successfully
- [ ] All 4 tools appear in inspector
- [ ] search_wiki_pages works
- [ ] get_page_content works
- [ ] list_navigation works
- [ ] get_wiki_status works
- [ ] Error handling works (doesn't crash)
- [ ] Direct execution starts server

## Next Steps

If all tests pass, move to Task 2.8 to publish the MCP server to npm.
