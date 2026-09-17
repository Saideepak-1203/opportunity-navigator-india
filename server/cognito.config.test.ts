import { describe, expect, it } from "vitest";

describe("Cognito configuration", () => {
  it("authenticates the configured confidential client at the token endpoint", async () => {
    const domain = process.env.COGNITO_DOMAIN ?? "https://eu-north-1xtc8oemol.auth.eu-north-1.amazoncognito.com";
    const clientId = process.env.COGNITO_CLIENT_ID ?? "1rfnnfcpoundgfgi453pok4fbu";
    const clientSecret = process.env.COGNITO_CLIENT_SECRET;

    expect(clientSecret, "COGNITO_CLIENT_SECRET must be configured").toBeTruthy();

    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const response = await fetch(`${domain}/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=authorization_code&code=sloth-invalid-test-code&redirect_uri=https%3A%2F%2F3000-iy4wws9f4dlot0e1l4mig-e46fb563.sg2.manus.computer%2Fapi%2Fauth%2Fcallback",
    });

    // A valid client secret reaches Cognito's grant validation. Invalid client
    // credentials are rejected first with 401 invalid_client.
    expect(response.status).not.toBe(401);
  }, 20_000);
});
