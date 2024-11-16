import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import oEmbedVitePlugin from "./build/oEmbedVitePlugin";

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_URL ?? "/",
  plugins: [vue(), oEmbedVitePlugin()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 8080,
  },
});
