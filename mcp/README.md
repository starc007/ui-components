# beUI MCP server

Remote [MCP](https://modelcontextprotocol.io) server for the beUI component registries, running on a Cloudflare Worker. It lets AI agents discover, inspect, and install both free beUI components and licensed beUI Pro blocks.

It owns no data — it reads the live `beui.dev/r/*` registry endpoints at runtime (edge-cached), so new components appear without redeploying the worker.

## Connect

Add to your MCP client (Claude Desktop, Cursor, etc.):

```
https://mcp.beui.dev/mcp
```

Streamable HTTP is recommended. An SSE endpoint (`/sse`) exists for legacy clients.

## Connect to beUI Pro

Paid users can connect Claude and other OAuth-capable clients directly to:

```
https://mcp.beui.dev/pro/mcp
```

The client opens a beUI Pro authorization page where the customer enters the
same license key they use as `BEUI_PRO_TOKEN`. Clients that support custom
headers can continue to configure that key directly:

```json
{
  "mcpServers": {
    "beui-pro": {
      "url": "https://mcp.beui.dev/pro/mcp",
      "headers": {
        "Authorization": "Bearer ${BEUI_PRO_TOKEN}"
      }
    }
  }
}
```

The Pro endpoint supports OAuth 2.1 discovery, dynamic client registration,
authorization-code flow with PKCE, rotating refresh tokens, and direct license
key bearer authentication. OAuth grants keep the license key encrypted and
forward it to the private registry only while serving authenticated tool calls.
The server does not accept tokens as tool arguments, include them in tool
results, or cache authenticated source responses.

## Tools

| tool | input | returns |
|---|---|---|
| `list_components` | `category?` | components (slug, name, category, description) |
| `search_components` | `query` | best-matching components |
| `get_component` | `slug` | description, dependencies, all source files, install command |
| `get_install_command` | `slug`, `packageManager?` | shadcn CLI command per package manager |

The Pro endpoint exposes the same four tool names against the installable
`@beui-pro` catalog. `get_component` returns the licensed source files, while
`get_install_command` also returns the registry configuration required by the
shadcn CLI. Standalone templates that are not in the private shadcn index are
not exposed as installable components.

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

OAuth also requires the `OAUTH_KV` namespace configured in `wrangler.jsonc`.
