import { initTRPC } from '@trpc/server';
import superjson from 'superjson';

interface Context {
  request?: Request;
  setCookie?: (name: string, value: string, options?: any) => void;
}

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
