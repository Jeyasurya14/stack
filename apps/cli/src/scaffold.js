import fs from "node:fs";
import path from "node:path";

const BINARY_EXT = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".ico", ".webp",
  ".zip", ".jar", ".class", ".pdf", ".woff", ".woff2", ".ttf",
  ".exe", ".dll", ".so", ".dylib",
]);

/**
 * Copy a template directory into target, rewriting placeholders like
 * {{PROJECT_NAME}} and {{DB}} inside text files.
 */
export async function scaffold({ templateDir, target, vars }) {
  const resolvedTemplate = fs.realpathSync(templateDir);
  fs.mkdirSync(target, { recursive: true });
  await copyDir(resolvedTemplate, target, vars, resolvedTemplate);
}

async function copyDir(src, dst, vars, rootSrc) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    // npm/pnpm strips real `.gitignore` from published packages;
    // templates ship `_gitignore` and we restore the dot-name on scaffold.
    // Also rewrite {{PLACEHOLDER}} in filenames (e.g. `{{PROJECT_NAME}}.csproj`).
    const renamed = entry.name === "_gitignore" ? ".gitignore" : entry.name;
    const outName = applyVars(renamed, vars);
    const s = path.join(src, entry.name);
    const d = path.join(dst, outName);

    // Path traversal / symlink escape guard.
    const realS = fs.realpathSync(s);
    if (!realS.startsWith(rootSrc)) {
      throw new Error(`Refusing to follow symlink escaping template: ${s}`);
    }

    if (entry.isSymbolicLink()) continue; // skip symlinks for portability

    if (entry.isDirectory()) {
      await copyDir(s, d, vars, rootSrc);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (BINARY_EXT.has(ext)) {
        fs.copyFileSync(s, d);
      } else {
        const buf = fs.readFileSync(s);
        // Skip placeholder replacement if it looks binary (null bytes).
        if (buf.includes(0)) {
          fs.writeFileSync(d, buf);
        } else {
          fs.writeFileSync(d, applyVars(buf.toString("utf8"), vars));
        }
      }
      try {
        const mode = fs.statSync(s).mode;
        fs.chmodSync(d, mode);
      } catch {
        // best-effort on Windows
      }
    }
  }
}

function applyVars(content, vars) {
  return content.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) =>
    vars[k] !== undefined ? String(vars[k]) : `{{${k}}}`
  );
}
