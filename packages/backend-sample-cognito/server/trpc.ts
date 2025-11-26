import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { AmplifyAuthService } from './auth-service';

const authService = new AmplifyAuthService();

interface Context {
  request?: Request;
  authHeader?: string | null;
  user?: any;
}

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

// 認証が必要なプロシージャ
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const result = await authService.verifyAuthorizationHeader(ctx.authHeader || undefined);
  
  if (!result.valid) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: result.error || '認証が必要です',
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: result.payload,
    },
  });
});
