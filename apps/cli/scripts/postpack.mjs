// Restore the dev-time state after `npm pack` / `npm publish`:
//  1. Remove the bundled ./templates copy.
//  2. Rewrite src/_vendor/stacks.js back to the re-export stub.
//
// On Windows (especially OneDrive) unlink() can transiently fail with EBUSY
// because another process briefly holds the handle. Retry with backoff.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_DIR = path.resolve(__dirname, "..");

function sleep(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) { /* busy-wait: we're in a short-lived script */ }
}

function rmRecursiveWithRetry(target, label, { attempts = 8, delayMs = 150 } = {}) {
  if (!fs.existsSync(target)) return;
  let lastErr;
  for (let i = 1; i <= attempts; i++) {
    try {
      fs.rmSync(target, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
      return;
    } catch (err) {
      lastErr = err;
      if (err?.code !== "EBUSY" && err?.code !== "EPERM" && err?.code !== "ENOTEMPTY") throw err;
      sleep(delayMs * i);
    }
  }
  // Don't abort publish over cleanup — warn and move on.
  console.warn(`[postpack] could not remove ${label} after ${attempts} tries: ${lastErr?.message}`);
  console.warn(`[postpack]   you may need to delete it manually: ${target}`);
}

const TPL_DST = path.join(CLI_DIR, "templates");
rmRecursiveWithRetry(TPL_DST, "bundled templates");
console.log("[postpack] cleaned bundled templates");

const VENDOR_DST = path.resolve(CLI_DIR, "src", "_vendor", "stacks.js");
const stub =
  "// Dev-time re-export from the workspace package. At publish time, the\n" +
  "// prepack script OVERWRITES this file with a copy of the actual source\n" +
  "// so the tarball is self-contained. postpack restores this re-export.\n" +
  'export * from "@polystack/core/stacks";\n';
fs.writeFileSync(VENDOR_DST, stub);
console.log("[postpack] restored _vendor/stacks.js re-export stub");
