// Prepare the CLI package for publishing.
//  1. Copy monorepo templates into ./templates (self-contained tarball).
//  2. Overwrite src/_vendor/stacks.js (a re-export stub in dev) with a
//     COPY of the canonical packages/core/src/stacks.js so the published
//     package no longer has any `@polystack/core` (workspace) dependency.
// postpack.mjs reverses step (2) so the repo stays in its dev state.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_DIR = path.resolve(__dirname, "..");
const ROOT = path.resolve(CLI_DIR, "..", "..");

// ---- templates ----
const TPL_SRC = path.resolve(ROOT, "packages", "templates");
const TPL_DST = path.join(CLI_DIR, "templates");
if (!fs.existsSync(TPL_SRC)) {
  console.error(`[prepack] templates source missing: ${TPL_SRC}`);
  process.exit(1);
}
fs.rmSync(TPL_DST, { recursive: true, force: true });
fs.cpSync(TPL_SRC, TPL_DST, { recursive: true });
console.log(`[prepack] bundled templates → ${TPL_DST}`);

// ---- vendored core ----
const CORE_SRC = path.resolve(ROOT, "packages", "core", "src", "stacks.js");
const VENDOR_DST = path.resolve(CLI_DIR, "src", "_vendor", "stacks.js");
if (!fs.existsSync(CORE_SRC)) {
  console.error(`[prepack] core source missing: ${CORE_SRC}`);
  process.exit(1);
}
const header =
  "// AUTO-GENERATED during `npm pack`/`npm publish` from packages/core/src/stacks.js.\n" +
  "// Reverted to a dev re-export by postpack.mjs. Do not edit by hand.\n\n";
fs.writeFileSync(VENDOR_DST, header + fs.readFileSync(CORE_SRC, "utf8"));
console.log(`[prepack] vendored core → ${VENDOR_DST}`);
