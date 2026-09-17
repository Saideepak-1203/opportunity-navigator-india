import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import { createRemoteJWKSet, jwtVerify } from "jose";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { ENV } from "./env";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

const COGNITO_STATE_COOKIE = "__Host-cognito_state";
const COGNITO_STATE_MAX_AGE_MS = 10 * 60 * 1000;

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

function getPublicOrigin(req: Request): string {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const forwardedHost = req.headers["x-forwarded-host"];
  const protocol = (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto) || req.protocol;
  const host = (Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost) || req.get("host");
  if (!host) throw new Error("Unable to determine public request host");
  return `${protocol}://${host}`;
}

function getCognitoConfig() {
  if (!ENV.cognitoRegion || !ENV.cognitoUserPoolId || !ENV.cognitoClientId || !ENV.cognitoClientSecret || !ENV.cognitoDomain) {
    throw new Error("Cognito authentication is not fully configured");
  }
  return {
    region: ENV.cognitoRegion,
    userPoolId: ENV.cognitoUserPoolId,
    clientId: ENV.cognitoClientId,
    clientSecret: ENV.cognitoClientSecret,
    domain: ENV.cognitoDomain.replace(/\/+$/, ""),
    issuer: ENV.cognitoIssuer,
  };
}

function getCognitoStateCookieOptions(req: Request) {
  const sessionOptions = getSessionCookieOptions(req);
  return {
    ...sessionOptions,
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: COGNITO_STATE_MAX_AGE_MS,
  };
}

function buildRedirectUri(req: Request): string {
  return `${getPublicOrigin(req)}/api/auth/callback`;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/auth/login", (req: Request, res: Response) => {
    try {
      const config = getCognitoConfig();
      const mode = getQueryParam(req, "mode") === "signUp" ? "signUp" : "signIn";
      const state = crypto.randomUUID();
      const redirectUri = buildRedirectUri(req);
      const endpoint = mode === "signUp" ? "/signup" : "/login";
      const url = new URL(`${config.domain}${endpoint}`);
      url.searchParams.set("client_id", config.clientId);
      url.searchParams.set("response_type", "code");
      url.searchParams.set("scope", "openid email");
      url.searchParams.set("redirect_uri", redirectUri);
      url.searchParams.set("state", state);
      res.cookie(COGNITO_STATE_COOKIE, state, getCognitoStateCookieOptions(req));
      res.redirect(302, url.toString());
    } catch (error) {
      console.error("[Cognito] Login setup failed", error);
      res.status(500).json({ error: "Cognito authentication is not configured" });
    }
  });

  app.get("/api/auth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    const providerError = getQueryParam(req, "error");
    if (providerError) {
      res.status(401).json({ error: "Cognito authentication was cancelled", detail: providerError });
      return;
    }
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    const expectedState = parseCookieHeader(req.headers.cookie ?? "")[COGNITO_STATE_COOKIE];
    if (!expectedState || state !== expectedState) {
      res.status(403).json({ error: "invalid Cognito state" });
      return;
    }
    res.clearCookie(COGNITO_STATE_COOKIE, { path: "/", secure: true, sameSite: "lax" });

    try {
      const config = getCognitoConfig();
      const redirectUri = buildRedirectUri(req);
      const basicAuth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
      const tokenResponse = await fetch(`${config.domain}/oauth2/token`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        }),
      });
      if (!tokenResponse.ok) {
        const detail = await tokenResponse.text().catch(() => "token exchange failed");
        console.error("[Cognito] Token exchange failed", tokenResponse.status, detail.slice(0, 300));
        res.status(502).json({ error: "Cognito token exchange failed" });
        return;
      }
      const tokens = await tokenResponse.json() as { id_token?: string; access_token?: string };
      if (!tokens.id_token) {
        res.status(502).json({ error: "Cognito did not return an ID token" });
        return;
      }

      const jwks = createRemoteJWKSet(new URL(`${config.issuer}/.well-known/jwks.json`));
      const verified = await jwtVerify(tokens.id_token, jwks, {
        issuer: config.issuer,
        audience: config.clientId,
      });
      const claims = verified.payload;
      const sub = typeof claims.sub === "string" ? claims.sub : "";
      if (!sub) {
        res.status(400).json({ error: "Cognito subject missing from ID token" });
        return;
      }

      const email = typeof claims.email === "string" ? claims.email : null;
      const name = typeof claims.name === "string" ? claims.name : typeof claims.preferred_username === "string" ? claims.preferred_username : email;
      const openId = `cognito:${sub}`;
      await db.upsertUser({
        openId,
        name: name || null,
        email,
        loginMethod: "cognito",
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(openId, {
        name: name || "",
        expiresInMs: ONE_YEAR_MS,
      });
      res.cookie(COOKIE_NAME, sessionToken, { ...getSessionCookieOptions(req), maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[Cognito] Callback failed", error);
      res.status(500).json({ error: "Cognito callback failed" });
    }
  });

  app.get("/api/auth/logout", (req: Request, res: Response) => {
    try {
      const config = getCognitoConfig();
      const logoutUri = `${getPublicOrigin(req)}/`;
      res.clearCookie(COOKIE_NAME, { ...getSessionCookieOptions(req), maxAge: -1 });
      const url = new URL(`${config.domain}/logout`);
      url.searchParams.set("client_id", config.clientId);
      url.searchParams.set("logout_uri", logoutUri);
      res.redirect(302, url.toString());
    } catch (error) {
      console.error("[Cognito] Logout failed", error);
      res.clearCookie(COOKIE_NAME, { ...getSessionCookieOptions(req), maxAge: -1 });
      res.redirect(302, "/");
    }
  });
}
