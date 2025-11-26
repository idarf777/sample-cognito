import { router, publicProcedure, protectedProcedure } from './trpc';
import { AmplifyAuthService } from './auth-service';
import { z } from 'zod';

const authService = new AmplifyAuthService();

export const appRouter = router({
  auth: router({
    verifyToken: publicProcedure
      .input(z.object({
        token: z.string(),
        type: z.enum(['access', 'id']),
      }))
      .query(async ({ input }) => {
        if (input.type === 'access') {
          return await authService.verifyAccessToken(input.token);
        } else {
          return await authService.verifyIdToken(input.token);
        }
      }),
  }),

  user: router({
    // 認証が必要なエンドポイント
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      return {
        userId: ctx.user.sub,
        username: ctx.user.username,
        scope: ctx.user.scope,
      };
    }),

    // 従来の互換性のためのエンドポイント
    getUserInfo: protectedProcedure.query(async ({ ctx }) => {
      return {
        user: ctx.user.username,
        userId: ctx.user.sub,
        payload: ctx.user,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
