# beUI MCP server

Remote [MCP](https://modelcontextprotocol.io) server for the beUI component registries, running on a Cloudflare Worker. It lets AI agents discover, inspect, and install both free beUI components and licensed beUI Pro blocks.

The free tools read the live `beui.dev/r/*` registry endpoints at runtime
(edge-cached), so new components appear without redeploying the worker. Each
request gets a fresh MCP server, with no persistent MCP session state.

## Connect

Add to your MCP client (Claude Desktop, Cursor, etc.):

```
https://mcp.beui.dev/mcp
```

Use Streamable HTTP. The legacy `/sse` endpoint and its message routes have been
removed and return `410`. Clients configured for SSE must switch their transport
to Streamable HTTP and use `/mcp`. Standalone GET streams at `/mcp` return `405`.

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
| `list_native_components` | `query?` | beUI Native (React Native) components, setup notes and the Expo Go showcase link |
| `get_native_component` | `slug` | install commands, setup notes and every file to copy (component, shared helpers, theme) |

The native tools read `beui.dev/native/r` and `beui.dev/native/r/{slug}`.

The Pro endpoint exposes the same four tool names against the installable
`@beui-pro` catalog. `get_component` returns the licensed source files, while
`get_install_command` also returns the registry configuration required by the
shadcn CLI. Standalone templates that are not in the private shadcn index are
not exposed as installable components. List and search results carry a
`platform` of `web` or `mobile`.

Pro also has `list_mobile_components` (`query?`, `kind?`), which reads
`pro.beui.dev/r` and lists the license's React Native blocks and screens with
their install slug (`native-<slug>`), kind, catalog page and Expo SDK. Licenses
without mobile access get an error naming the Mobile and Web + Mobile licenses.
Install a mobile item with `get_component` or `get_install_command`.

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

## Historical session storage

The old `BeUiMcp` Durable Object namespace was retired by the
`v2-retire-session-storage` delete migration. Public MCP requests do not use
Durable Objects. Pro authentication continues to use the separate `OAUTH_KV`
namespace.
