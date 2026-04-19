// Restore the dev-time state after `npm pack`/`npm publish`:
//  1. Remove the bundled ./templates copy.
//  2. Rewrite src/_vendor/stacks.js back to the re-export stub.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_DIR = path.resolve(__dirname, "..");

const TPL_DST = path.join(CLI_DIR, "templates");
fs.rmSync(TPL_DST, { recursive: true, force: true });
console.log("[postpack] cleaned bundled templates");

const VENDOR_DST = path.resolve(CLI_DIR, "src", "_vendor", "stacks.js");
const stub =
  "// Dev-time re-export from the workspace package. At publish time, the\n" +
  "// prepack script OVERWRITES this file with a copy of the actual source\n" +
  "// so the tarball is self-contained. postpack restores this re-export.\n" +
  'export * from "@polystack/core/stacks";\n';
fs.writeFileSync(VENDOR_DST, stub);
console.log("[postpack] restored _vendor/stacks.js re-export stub");
