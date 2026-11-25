import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import statsHandler from "./api/stats";

function localStatsApiPlugin(): Plugin {
  return {
    name: "buckme-local-stats-api",
    configureServer(server) {
      server.middlewares.use("/api/stats", (req, res) => {
        void statsHandler(req, res);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use("/api/stats", (req, res) => {
        void statsHandler(req, res);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), localStatsApiPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
