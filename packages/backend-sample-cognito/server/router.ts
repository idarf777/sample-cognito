import { router, publicProcedure, protectedProcedure } from './trpc';
import { AmplifyAuthService } from './auth-service';
import { z } from 'zod';

const authService = new AmplifyAuthService();

export const appRouter = router({
  auth: router({
    // トークン検証エンドポイント
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
    getUserInfo: protectedProcedure.query(async ({ ctx }) => {
      return {
        userId: ctx.user.sub,
        username: ctx.user.username,
        scope: ctx.user.scope,
      };
    }),

  }),
});

export type AppRouter = typeof appRouter;
