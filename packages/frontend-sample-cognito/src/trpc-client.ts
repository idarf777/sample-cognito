import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from 'shared-types';
import superjson from 'superjson';

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3001/trpc',
      //url: 'https://localhost:3001/trpc',
      transformer: superjson,
    }),
  ],
});
