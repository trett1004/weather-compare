import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "legal-pages",
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url === "/impressum") req.url = "/impressum.html";
          if (req.url === "/datenschutz") req.url = "/datenschutz.html";
          next();
        });
      },
    },
  ],
  server: {
    proxy: {
      "/auth": "http://localhost:3000",
      "/api": "http://localhost:3000",
    },
  },
});
