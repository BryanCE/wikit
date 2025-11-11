## WikiJS GraphQL Schema Location

**wikit** is the CLI tool we're building (this repo: `/mnt/c/Users/bryan/Documents/wikit`)

**Wiki.js source code** is located at: `/mnt/c/Users/bryan/Documents/wiki`

To find the actual GraphQL schema definitions, look in the Wiki.js source:
- **Schema directory:** `/mnt/c/Users/bryan/Documents/wiki/server/graph/schemas/`

Key schema files:
- `user.graphql` - **User type definitions (IMPORTANT for wikit export/import)**
- `group.graphql` - Group type definitions
- `page.graphql` - Page types
- `navigation.graphql` - Navigation types
- `site.graphql` - Site config
- `common.graphql` - Common types and responses
- `scalars.graphql` - Custom scalar types

**Full schema reference for this project**: See `wikit/.claude/docs/wikijs-graphql-schema.md` for complete User type definitions extracted from the Wiki.js source.
