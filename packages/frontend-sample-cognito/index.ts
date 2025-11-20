import indexHtml from "./index.html";

const server = Bun.serve({
  port: 3000,
  routes: {
    "/": indexHtml,
  },
  development: {
    hmr: true,
    console: true,
  }
});

console.log(`🚀 Frontend server running at http://localhost:${server.port}`);
