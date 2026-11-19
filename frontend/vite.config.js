import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import process from "node:process";
import { defineConfig } from "vite";

// arquivos do public/ pra cachear
const PUBLIC_APP_FILES = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/favicon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
];

// gera o dist/sw.js com a lista de arquivos desse build
function serviceWorker() {
  return {
    name: "finexp-service-worker",
    apply: "build",
    generateBundle(_, bundle) {
      const builtFiles = Object.keys(bundle)
        .filter((file) => !file.endsWith(".map"))
        .map((file) => `/${file}`);
      const precache = [...new Set([...PUBLIC_APP_FILES, ...builtFiles])];
      const version = createHash("sha256").update(precache.join("|")).digest("hex").slice(0, 12);

      const template = readFileSync(new URL("./src/pwa/service-worker.js", import.meta.url), "utf8");
      const source = template
        .replace('"__CACHE_VERSION__"', JSON.stringify(version))
        .replace('["__PRECACHE_URLS__"]', JSON.stringify(precache));

      this.emitFile({ type: "asset", fileName: "sw.js", source });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), serviceWorker()],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    proxy: {
      "/auth": "http://localhost:8080/",
    },
  },
});
