// Renames the Capacitor build entry (capacitor.html) to index.html so the
// Android WebView can load it, and strips web-only files from the bundle.
import { existsSync, renameSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const dir = resolve(process.cwd(), "dist-android");
const from = resolve(dir, "capacitor.html");
const to = resolve(dir, "index.html");

if (!existsSync(from)) {
  console.error("dist-android/capacitor.html not found — did the Vite build run?");
  process.exit(1);
}

renameSync(from, to);

// The native app never uses the PWA service worker or the web manifest.
for (const file of ["sw.js", "registerSW.js", "manifest.webmanifest", "robots.txt"]) {
  rmSync(resolve(dir, file), { force: true });
}

console.log("Android web bundle ready: dist-android/index.html");
