import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("profile routes", () => {
  it("rejects unauthenticated profile reads", async () => {
    const ctx: TrpcContext = {
      user: undefined,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);
    await expect(caller.profile.get()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
