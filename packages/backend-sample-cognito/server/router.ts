import { router, publicProcedure } from './trpc';
import { AmplifyAuthService } from './auth-service';
import { MagicLinkService } from './magic-link-service';
import { z } from 'zod';

const authService = new AmplifyAuthService();
const magicLinkService = new MagicLinkService();

export const appRouter = router({
  auth: router({
    loginWithProvider: publicProcedure
      .input(z.object({
        provider: z.enum(['Google', 'Facebook', 'LINE', 'Apple'])
      }))
      .query(async ({ input }) => {
        return await authService.loginWithProvider(input.provider);
      }),

    // マジックリンク送信
    sendMagicLink: publicProcedure
      .input(z.object({
        email: z.string().email('有効なメールアドレスを入力してください')
      }))
      .mutation(async ({ input }) => {
        return await magicLinkService.sendMagicLink(input.email);
      }),

    // マジックリンクトークン検証
    verifyMagicLink: publicProcedure
      .input(z.object({
        token: z.string().min(1, 'トークンが必要です')
      }))
      .mutation(async ({ input }) => {
        const verification = await magicLinkService.verifyToken(input.token);

        if (!verification.valid) {
          throw new Error(verification.error || '認証に失敗しました');
        }

        // ユーザーセッションを作成
        const userSession = await magicLinkService.createUserSession(verification.email!);

        return {
          success: true,
          user: userSession,
        };
      }),

    logout: publicProcedure.mutation(async () => {
      return await authService.logout();
    }),

    isAuthenticated: publicProcedure.query(async () => {
      return await authService.isAuthenticated();
    }),

    getUserInfo: publicProcedure.query(async () => {
      return await authService.getUserInfo();
    }),

    getAccessToken: publicProcedure.query(async () => {
      return await authService.getAccessToken();
    }),
  }),
});

export type AppRouter = typeof appRouter;
