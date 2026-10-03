import OAuthProvider from "@cloudflare/workers-oauth-provider";
import { createMcpHandler } from "agents/mcp";
import { DurableObject, WorkerEntrypoint } from "cloudflare:workers";
import {
  handleAuthorization,
  type McpOAuthProps,
  type OAuthEnv,
  PRO_MCP_RESOURCE,
  PRO_MCP_SCOPE,
  resolveLicenseToken,
} from "./oauth.js";
import { createFreeServer } from "./free-server.js";
import { createProServer } from "./pro-server.js";

interface Env extends OAuthEnv {
  REGISTRY_URL?: string;
  PRO_REGISTRY_URL?: string;
}

// Keep the existing namespace intact until its separate storage cleanup.
// Public MCP requests never instantiate this class.
export class BeUiMcp extends DurableObject<Env> {}

const LANDING = `beUI MCP server

Animated components and premium blocks for React and Next.js.

Connect your MCP client to:
  https://mcp.beui.dev/mcp   (stateless Streamable HTTP)
  https://mcp.beui.dev/pro/mcp   (beUI Pro, bearer token required)

Tools: list_components, search_components, get_component, get_install_command
Docs:  https://beui.dev
`;

class ProMcpHandler extends WorkerEntrypoint<Env, McpOAuthProps> {
  async fetch(request: Request) {
    const server = createProServer(
      this.env,
      this.ctx.props.registryAuthorization,
    );
    const response = await createMcpHandler(server, { route: "/pro/mcp" })(
      request,
      this.env,
      this.ctx,
    );
    response.headers.set("cache-control", "private, no-store");
    return response;
  }
}

const defaultHandler: ExportedHandler<Env> = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/authorize") return handleAuthorization(request, env);

    if (url.pathname === "/mcp") {
      // Stateless tools do not need a standalone session/listen stream.
      if (request.method === "GET") {
        return new Response("Use Streamable HTTP POST requests at /mcp.", {
          status: 405,
          headers: { allow: "POST, DELETE, OPTIONS", "access-control-allow-origin": "*" },
        });
      }
      return createMcpHandler(createFreeServer(env), {
        route: "/mcp",
        enableJsonResponse: true,
      })(request, env, ctx);
    }

    if (url.pathname === "/sse" || url.pathname.startsWith("/sse/")) {
      return new Response("The legacy SSE transport has been retired. Connect to /mcp using Streamable HTTP.", {
        status: 410,
      });
    }

    return new Response(LANDING, {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  },
};

export default new OAuthProvider<Env>({
  apiRoute: "/pro/mcp",
  apiHandler: ProMcpHandler,
  defaultHandler,
  authorizeEndpoint: "/authorize",
  tokenEndpoint: "/token",
  clientRegistrationEndpoint: "/register",
  clientIdMetadataDocumentEnabled: true,
  scopesSupported: [PRO_MCP_SCOPE],
  resourceMetadata: {
    resource: PRO_MCP_RESOURCE,
    scopes_supported: [PRO_MCP_SCOPE],
    bearer_methods_supported: ["header"],
    resource_name: "beUI Pro MCP",
  },
  resolveExternalToken: resolveLicenseToken,
});
