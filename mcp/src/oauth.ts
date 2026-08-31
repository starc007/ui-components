import {
  AuthorizationError,
  type AuthRequest,
  ExternalTokenError,
  type OAuthHelpers,
} from "@cloudflare/workers-oauth-provider";

export const PRO_MCP_RESOURCE = "https://mcp.beui.dev/pro/mcp";
export const PRO_MCP_SCOPE = "mcp:read";

export type McpOAuthProps = {
  registryAuthorization: string;
};

export type OAuthEnv = {
  OAUTH_PROVIDER: OAuthHelpers;
  OAUTH_KV: KVNamespace;
  PRO_API_URL?: string;
};

type ConsentPageOptions = {
  action: string;
  clientName: string;
  redirectHost: string;
  error?: string;
};

function apiBase(env: OAuthEnv) {
  return (env.PRO_API_URL ?? "https://api.beui.dev").replace(/\/$/, "");
}

async function verifyLicenseKey(env: OAuthEnv, licenseKey: string) {
  const response = await fetch(`${apiBase(env)}/v1/verify`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({ token: licenseKey }),
  });

  if (!response.ok) {
    throw new Error(`License verification failed with status ${response.status}.`);
  }

  const body = (await response.json()) as { valid?: boolean };
  return body.valid === true;
}

async function licenseUserId(licenseKey: string) {
  const bytes = new TextEncoder().encode(licenseKey);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return `license-${Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("")}`;
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character] ?? character,
  );
}

function consentPage({
  action,
  clientName,
  redirectHost,
  error,
}: ConsentPageOptions) {
  const safeClientName = escapeHtml(clientName);
  const safeRedirectHost = escapeHtml(redirectHost);
  const errorMarkup = error
    ? `<p class="error" role="alert">${escapeHtml(error)}</p>`
    : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Authorize ${safeClientName} · beUI Pro</title>
    <style>
      :root { color-scheme: light dark; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      * { box-sizing: border-box; }
      body { min-height: 100vh; margin: 0; display: grid; place-items: center; padding: 24px; background: #f5f5f4; color: #1c1917; }
      main { width: min(100%, 440px); border: 1px solid #d6d3d1; border-radius: 20px; background: #fff; padding: 28px; box-shadow: 0 18px 50px rgb(28 25 23 / 8%); }
      .brand { margin: 0 0 28px; font-size: 14px; font-weight: 700; letter-spacing: -.02em; }
      h1 { margin: 0; font-size: 24px; line-height: 1.2; letter-spacing: -.035em; }
      .description { margin: 12px 0 24px; color: #78716c; font-size: 14px; line-height: 1.6; }
      label { display: block; margin-bottom: 8px; font-size: 13px; font-weight: 600; }
      input { width: 100%; height: 44px; border: 1px solid #d6d3d1; border-radius: 12px; padding: 0 13px; background: transparent; color: inherit; font: inherit; outline: none; }
      input:focus { border-color: #57534e; box-shadow: 0 0 0 3px rgb(120 113 108 / 14%); }
      .hint { margin: 8px 0 0; color: #78716c; font-size: 12px; line-height: 1.5; }
      .error { margin: 0 0 16px; border-radius: 10px; background: #fef2f2; padding: 10px 12px; color: #b91c1c; font-size: 13px; line-height: 1.45; }
      .actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 24px; }
      button { height: 42px; border-radius: 999px; border: 1px solid #d6d3d1; background: transparent; color: inherit; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer; }
      button[type="submit"] { border-color: #1c1917; background: #1c1917; color: #fff; }
      button:hover { opacity: .86; }
      .privacy { margin: 22px 0 0; color: #a8a29e; font-size: 11px; line-height: 1.5; text-align: center; }
      @media (prefers-color-scheme: dark) {
        body { background: #0c0a09; color: #fafaf9; }
        main { border-color: #292524; background: #1c1917; box-shadow: none; }
        .description, .hint { color: #a8a29e; }
        input, button { border-color: #44403c; }
        input:focus { border-color: #a8a29e; }
        button[type="submit"] { border-color: #fafaf9; background: #fafaf9; color: #1c1917; }
        .error { background: rgb(127 29 29 / 28%); color: #fecaca; }
      }
    </style>
  </head>
  <body>
    <main>
      <p class="brand">beUI Pro</p>
      <h1>Connect ${safeClientName}</h1>
      <p class="description">Allow this connector to list, search, and read the premium source files included with your beUI Pro license. After approval, you’ll return to <strong>${safeRedirectHost}</strong>.</p>
      ${errorMarkup}
      <form method="post" action="${escapeHtml(action)}">
        <label for="license-key">License key</label>
        <input id="license-key" name="license_key" type="password" autocomplete="off" spellcheck="false" required autofocus />
        <p class="hint">Use the <strong>beui_live_…</strong> key from your dashboard or purchase email.</p>
        <div class="actions">
          <button type="submit" name="decision" value="deny" formnovalidate>Cancel</button>
          <button type="submit" name="decision" value="approve">Authorize</button>
        </div>
      </form>
      <p class="privacy">Your license key is used only to verify access and is never shared with the connector.</p>
    </main>
  </body>
</html>`;
}

function html(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "cache-control": "private, no-store",
      "content-security-policy":
        "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",
      "content-type": "text/html; charset=utf-8",
      "referrer-policy": "no-referrer",
      "x-content-type-options": "nosniff",
    },
  });
}

function authorizationError(error: AuthorizationError) {
  if (!error.redirectUri) return new Response(error.description, { status: 400 });

  const redirect = new URL(error.redirectUri);
  redirect.searchParams.set("error", error.code);
  redirect.searchParams.set("error_description", error.description);
  if (error.state) redirect.searchParams.set("state", error.state);
  if (error.issuer) redirect.searchParams.set("iss", error.issuer);
  return Response.redirect(redirect.toString(), 302);
}

function denyAuthorization(request: AuthRequest) {
  const redirect = new URL(request.redirectUri);
  redirect.searchParams.set("error", "access_denied");
  redirect.searchParams.set("error_description", "Authorization was cancelled.");
  redirect.searchParams.set("state", request.state);
  if (request.issuer) redirect.searchParams.set("iss", request.issuer);
  return Response.redirect(redirect.toString(), 302);
}

export async function handleAuthorization(request: Request, env: OAuthEnv) {
  let oauthRequest: AuthRequest;
  try {
    oauthRequest = await env.OAUTH_PROVIDER.parseAuthRequest(request);
  } catch (cause) {
    if (cause instanceof AuthorizationError) return authorizationError(cause);
    throw cause;
  }

  const client = await env.OAUTH_PROVIDER.lookupClient(oauthRequest.clientId);
  if (!client) return new Response("Unknown OAuth client.", { status: 400 });

  const clientName = client.clientName?.trim() || "your MCP client";
  const redirectHost = new URL(oauthRequest.redirectUri).host;
  const url = new URL(request.url);
  const action = `${url.pathname}${url.search}`;

  if (request.method === "GET") {
    return html(consentPage({ action, clientName, redirectHost }));
  }

  if (request.method !== "POST") {
    return new Response("Method not allowed.", {
      status: 405,
      headers: { allow: "GET, POST" },
    });
  }

  const form = await request.formData();
  if (form.get("decision") !== "approve") return denyAuthorization(oauthRequest);

  const licenseKey = form.get("license_key")?.toString().trim() ?? "";
  if (!licenseKey.startsWith("beui_live_")) {
    return html(
      consentPage({
        action,
        clientName,
        redirectHost,
        error: "Enter a valid beUI Pro license key.",
      }),
      400,
    );
  }

  let valid: boolean;
  try {
    valid = await verifyLicenseKey(env, licenseKey);
  } catch {
    return html(
      consentPage({
        action,
        clientName,
        redirectHost,
        error: "Unable to verify your license right now. Try again.",
      }),
      503,
    );
  }

  if (!valid) {
    return html(
      consentPage({
        action,
        clientName,
        redirectHost,
        error: "That license key is invalid, expired, or revoked.",
      }),
      400,
    );
  }

  const scope = oauthRequest.scope.includes(PRO_MCP_SCOPE)
    ? [PRO_MCP_SCOPE]
    : [];
  const { redirectTo } = await env.OAUTH_PROVIDER.completeAuthorization({
    request: oauthRequest,
    userId: await licenseUserId(licenseKey),
    metadata: { clientName },
    scope,
    props: { registryAuthorization: `Bearer ${licenseKey}` } satisfies McpOAuthProps,
  });

  return Response.redirect(redirectTo, 302);
}

export async function resolveLicenseToken({
  token,
  env,
}: {
  token: string;
  env: OAuthEnv;
}) {
  if (!token.startsWith("beui_live_")) return null;

  let valid: boolean;
  try {
    valid = await verifyLicenseKey(env, token);
  } catch {
    throw new ExternalTokenError("temporarily_unavailable", {
      description: "Unable to verify the beUI Pro license right now.",
      statusCode: 503,
      headers: { "retry-after": "30" },
    });
  }

  if (!valid) return null;

  return {
    audience: PRO_MCP_RESOURCE,
    props: { registryAuthorization: `Bearer ${token}` } satisfies McpOAuthProps,
  };
}
