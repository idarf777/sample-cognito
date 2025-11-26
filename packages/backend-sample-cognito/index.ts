import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from './server/router';
import { configureAmplifyServer } from './server/auth-service';

// Amplifyの設定を初期化
configureAmplifyServer();

const server = Bun.serve({
  port: 3001,
  //tls: {
  //  key: Bun.file('./certs/key.pem'),
  //  cert: Bun.file('./certs/cert.pem'),
  //},
  async fetch(request) {
    // CORS headers
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': process.env.WEB_SERVICE_URL || 'http://localhost:3000',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // tRPC handler
    if (request.url.includes('/trpc')) {
      return fetchRequestHandler({
        endpoint: '/trpc',
        req: request,
        router: appRouter,
        createContext: () => ({ request }),
      }).then(response => {
        // Add CORS headers to response
        const headers = new Headers(response.headers);
        headers.set('Access-Control-Allow-Origin', process.env.WEB_SERVICE_URL || 'http://localhost:3000');
        headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        headers.set('Access-Control-Allow-Headers', 'Content-Type');
        headers.set('Access-Control-Allow-Credentials', 'true');

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      });
    }

    return new Response('Not Found', { status: 404 });
  },
});

//console.log(`🚀 Backend API server running at https://localhost:${server.port}`);
console.log(`🚀 Backend API server running at http://localhost:${server.port}`);