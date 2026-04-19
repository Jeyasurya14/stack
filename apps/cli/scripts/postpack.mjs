import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_DIR = path.resolve(__dirname, "..");
const DST = path.join(CLI_DIR, "templates");
fs.rmSync(DST, { recursive: true, force: true });
console.log("[postpack] cleaned bundled templates");
