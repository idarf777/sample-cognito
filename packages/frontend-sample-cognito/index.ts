import indexHtml from "./index.html";

const server = Bun.serve({
  port: 3000,
  //tls: {
  //  key: Bun.file('./certs/key.pem'),
  //  cert: Bun.file('./certs/cert.pem'),
  //},
  routes: {
    "/": indexHtml,
  },
  development: {
    hmr: true,
    console: true,
  }
});

console.log(`🚀 Frontend server running at https://localhost:${server.port}`);
