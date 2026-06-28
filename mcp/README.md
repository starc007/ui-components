# beUI MCP server

Remote [MCP](https://modelcontextprotocol.io) server for the beUI component registry, running on a Cloudflare Worker. Lets AI agents discover and install beUI components.

It owns no data — it reads the live `beui.dev/r/*` registry endpoints at runtime (edge-cached), so new components appear without redeploying the worker.

## Connect

Add to your MCP client (Claude Desktop, Cursor, etc.):

```
https://mcp.beui.dev/mcp
```

Streamable HTTP is recommended. An SSE endpoint (`/sse`) exists for legacy clients.

## Tools

| tool | input | returns |
|---|---|---|
| `list_components` | `category?` | components (slug, name, category, description) |
| `search_components` | `query` | best-matching components |
| `get_component` | `slug` | description, dependencies, all source files, install command |
| `get_install_command` | `slug`, `packageManager?` | shadcn CLI command per package manager |

## Develop

```bash
bun install
bun run dev        # local worker at http://localhost:8787
bun run typecheck
```

## Deploy

```bash
bun run deploy
```

Requires `beui.dev` on Cloudflare. Wrangler provisions the `mcp.beui.dev` custom domain on first deploy (see `routes` in `wrangler.jsonc`). To point at a different registry, set the `REGISTRY_URL` var.
