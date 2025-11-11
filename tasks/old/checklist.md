# Wikit Publishing & MCP Setup - Checklist

## Phase 1: Wikit Publishing

- [x] **Task 1.1** - Create barrel export files

  - [x] Create `src/api/index.ts`
  - [x] Create `src/commands/index.ts`
  - [x] Create `src/types/index.ts`
  - [x] Create `src/utils/index.ts`
  - [x] Create `src/config/index.ts`

- [x] **Task 1.2** - Update package.json

  - [x] Change name to `@bryance/wikit`
  - [x] Add exports field
  - [x] Add repository URLs
  - [x] Add keywords
  - [x] Verify dependencies

- [x] **Task 1.3** - Update tsconfig.json

  - [x] Enable `declaration: true`
  - [x] Enable `declarationMap: true`
  - [x] Set `outDir: "./dist"`
  - [x] Set `rootDir: "./src"`

- [x] **Task 1.4** - Test build

  - [x] Run `bun run build`
  - [x] Verify dist/ structure
  - [x] Check .d.ts files generated
  - [x] Verify all modules present

- [x] **Task 1.5** - Create/Update README

  - [x] Add installation instructions
  - [x] Add programmatic usage examples
  - [x] Document all exports
  - [x] Add TypeScript examples

- [ ] **Task 1.6** - Publish to npm
  - [ ] Login to npm
  - [ ] Run dry-run test
  - [ ] Publish package
  - [ ] Verify on npm

## Phase 2: MCP Server

- [ ] **Task 2.1** - Create new repository

  - [ ] Create wikit-mcp directory
  - [ ] Initialize git
  - [ ] Initialize bun project
  - [ ] Install dependencies

- [ ] **Task 2.2** - Create MCP structure

  - [ ] Create src/index.ts
  - [ ] Create src/server.ts
  - [ ] Create src/tools/ directory
  - [ ] Set up dist/ output

- [ ] **Task 2.3** - Create MCP package.json

  - [ ] Set name to `@bryance/wikit-mcp`
  - [ ] Add @bryance/wikit dependency
  - [ ] Add MCP SDK dependency
  - [ ] Configure bin entry

- [ ] **Task 2.4** - Create MCP server code

  - [ ] Implement server.ts with MCP setup
  - [ ] Implement index.ts entry point
  - [ ] Define 4 tools (search, get-page, navigation, status)
  - [ ] Add error handling

- [ ] **Task 2.5** - Create MCP tsconfig

  - [ ] Configure for ES2022
  - [ ] Set output directory
  - [ ] Configure module resolution

- [ ] **Task 2.6** - Create MCP README

  - [ ] Add installation instructions
  - [ ] Document configuration
  - [ ] Add Claude Desktop setup
  - [ ] List available tools

- [ ] **Task 2.7** - Test MCP locally

  - [ ] Build the project
  - [ ] Test with MCP inspector
  - [ ] Verify all tools work
  - [ ] Test error handling

- [ ] **Task 2.8** - Publish MCP to npm
  - [ ] Run build
  - [ ] Publish to npm
  - [ ] Verify package

## Completion

- [ ] Both packages published to npm
- [ ] Documentation complete
- [ ] Local testing verified
- [ ] Ready for users
