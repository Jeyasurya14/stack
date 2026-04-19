// Copy monorepo templates into ./templates so the published npm tarball
// is self-contained. Removed again by postpack.mjs.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_DIR = path.resolve(__dirname, "..");
const SRC = path.resolve(CLI_DIR, "..", "..", "packages", "templates");
const DST = path.join(CLI_DIR, "templates");

if (!fs.existsSync(SRC)) {
  console.error(`[prepack] templates source missing: ${SRC}`);
  process.exit(1);
}
fs.rmSync(DST, { recursive: true, force: true });
fs.cpSync(SRC, DST, { recursive: true });
console.log(`[prepack] bundled templates → ${DST}`);
