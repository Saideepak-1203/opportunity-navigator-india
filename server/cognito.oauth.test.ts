import express from "express";
import { createServer } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import { registerOAuthRoutes } from "./_core/oauth";

const servers: ReturnType<typeof createServer>[] = [];

afterEach(() => {
  for (const server of servers.splice(0)) server.close();
});

async function startTestServer() {
  const app = express();
  registerOAuthRoutes(app);
  const server = createServer(app);
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", () => resolve()));
  servers.push(server);
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Test server did not bind");
  return `http://127.0.0.1:${address.port}`;
}

describe("Cognito auth routes", () => {
  it("redirects sign-in to Cognito managed login without exposing the client secret", async () => {
    const baseUrl = await startTestServer();
    const response = await fetch(`${baseUrl}/api/auth/login?mode=signIn`, { redirect: "manual" });
    const location = response.headers.get("location") ?? "";
    expect(response.status).toBe(302);
    expect(location).toContain("/login?");
    expect(location).toContain("client_id=1rfnnfcpoundgfgi453pok4fbu");
    expect(location).not.toContain(process.env.COGNITO_CLIENT_SECRET ?? "secret-not-set");
  });

  it("redirects create-account to Cognito managed signup", async () => {
    const baseUrl = await startTestServer();
    const response = await fetch(`${baseUrl}/api/auth/login?mode=signUp`, { redirect: "manual" });
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toContain("/signup?");
  });
});
