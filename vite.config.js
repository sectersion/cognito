import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  publicDir: "static",
  build: {
    outDir: "public",
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
    proxy: {
      "/wisp": {
        target: "ws://localhost:8080",
        ws: true,
      },
      "/baremux": "http://localhost:8080",
      "/scram": "http://localhost:8080",
      "/libcurl": "http://localhost:8080",
    },
  },
});
