import app from "./server.js";

const PORT = process.env.PORT || 3000;
// Only reachable through the local reverse proxy (cloudflared) by default.
// Set HOST=0.0.0.0 to listen on all interfaces, e.g. for LAN testing.
const HOST = process.env.HOST || "127.0.0.1";
app.listen(PORT, HOST, () => {
  console.log(`Weather app running at http://${HOST}:${PORT}`);
});
