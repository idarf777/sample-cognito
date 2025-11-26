import { router, publicProcedure } from './trpc';
import { AmplifyAuthService } from './auth-service';
import { z } from 'zod';

const authService = new AmplifyAuthService();

export const appRouter = router({
  auth: router({
    loginWithProvider: publicProcedure
      .input(z.object({
        provider: z.enum(['Google', 'Facebook', 'LINE', 'LoginWithAmazon', 'COGNITO'])
      }))
      .query(async ({ input }) => {
        const result = await authService.loginWithProvider(input.provider);
        return result;
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

    authorizeCodeForToken: publicProcedure
      .input(z.object({
        code: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await authService.authorizeCodeForToken(input.code);
      }),
  }),
});

export type AppRouter = typeof appRouter;
