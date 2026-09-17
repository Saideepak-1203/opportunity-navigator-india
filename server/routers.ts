import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserByOpenId(ctx.user.openId);
      return user ? {
        profileName: user.profileName ?? user.name ?? "",
        journey: user.journey ?? "student",
        interests: user.interests ? JSON.parse(user.interests) as string[] : [],
        bio: user.bio ?? "",
      } : null;
    }),
    update: protectedProcedure.input(z.object({
      profileName: z.string().trim().min(1).max(160),
      journey: z.string().min(1).max(40),
      interests: z.array(z.string()).min(1).max(12),
      bio: z.string().max(500).optional(),
    })).mutation(async ({ ctx, input }) => {
      const user = await db.updateUserProfile(ctx.user.openId, input);
      return { success: true as const, profile: user };
    }),
  }),

  discovery: router({
    state: protectedProcedure.query(({ ctx }) => db.getUserDiscoveryState(ctx.user.openId)),
    update: protectedProcedure.input(z.object({
      saved: z.array(z.string()).max(100),
      dismissed: z.array(z.string()).max(100),
      tracked: z.array(z.string()).max(100),
    })).mutation(({ ctx, input }) => db.updateUserDiscoveryState(ctx.user.openId, input)),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
