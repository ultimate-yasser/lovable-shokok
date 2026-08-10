import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { resolve } from "node:path";

// Static, offline-only build for the Capacitor Android shell.
// No SSR, no service worker, no network dependency at runtime.
export default defineConfig({
  plugins: [tsConfigPaths({ projects: ["./tsconfig.json"] }), react(), tailwindcss()],
  base: "./",
  define: {
    // Native shell: skip the SSR <html>/<body> document shell, we mount into #root.
    "import.meta.env.VITE_NATIVE": JSON.stringify("true"),
  },
  resolve: {
    dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-store"],
  },
  build: {
    outDir: "dist-android",
    emptyOutDir: true,
    target: "es2022",
    rollupOptions: {
      input: resolve(process.cwd(), "capacitor.html"),
    },
  },
});
