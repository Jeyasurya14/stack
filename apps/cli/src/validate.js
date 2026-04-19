import path from "node:path";

const RESERVED = new Set([
  "node_modules", ".git", ".next", "dist", "build", "target", "vendor",
  "con", "prn", "aux", "nul",
  "com1", "com2", "com3", "com4", "com5", "com6", "com7", "com8", "com9",
  "lpt1", "lpt2", "lpt3", "lpt4", "lpt5", "lpt6", "lpt7", "lpt8", "lpt9",
]);

// npm-package-name-ish: lowercase letters, digits, dashes, underscores, dots.
// Length 1..214, can't start with . or _, no path separators.
const NAME_RE = /^(?!\.)(?!_)[a-z0-9._-]{1,214}$/;

export function validateProjectName(raw) {
  if (raw == null) return { ok: false, error: "Project name is required." };
  const name = String(raw).trim();
  if (!name) return { ok: false, error: "Project name cannot be empty." };
  if (name.includes("/") || name.includes("\\")) {
    return { ok: false, error: "Project name must not contain path separators." };
  }
  if (RESERVED.has(name.toLowerCase())) {
    return { ok: false, error: `"${name}" is a reserved name. Pick something else.` };
  }
  if (!NAME_RE.test(name)) {
    return {
      ok: false,
      error: "Project name must be lowercase letters, digits, dots, hyphens, or underscores (1-214 chars), and not start with . or _.",
    };
  }
  return { ok: true, value: name };
}

export function safeTargetPath(cwd, name) {
  const resolved = path.resolve(cwd, name);
  const cwdResolved = path.resolve(cwd);
  // Prevent `../escape` style names after resolution.
  if (!resolved.startsWith(cwdResolved + path.sep) && resolved !== cwdResolved) {
    throw new Error("Refusing to scaffold outside the current working directory.");
  }
  return resolved;
}
