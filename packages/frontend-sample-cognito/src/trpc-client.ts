import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from 'shared-types';
import superjson from 'superjson';
import { fetchAuthSession } from 'aws-amplify/auth';

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: import.meta.env.VITE_TRPC_SERVER_URL || 'http://localhost:3001/trpc',
      transformer: superjson,
      async headers() {
        try {
          // Amplifyからアクセストークンを取得
          const session = await fetchAuthSession();
          const accessToken = session.tokens?.accessToken?.toString();
          if (accessToken) {
            return {
              Authorization: `Bearer ${accessToken}`,
            };
          }
        } catch (error) {
          // 認証されていない場合はヘッダーなし
          console.log('No auth token available');
        }
        return {};
      },
    }),
  ],
});
