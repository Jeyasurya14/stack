import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/**
 * Resolve the package-install command to run for a given template and
 * optional user-chosen package manager. Returns `null` when the template
 * has no install step (e.g. Go, Rust — they fetch on first build).
 */
export function resolveInstallCommand(template, pm) {
  const JS_PM = { npm: ["npm", ["install"]], pnpm: ["pnpm", ["install"]], yarn: ["yarn"], bun: ["bun", ["install"]] };

  switch (template) {
    case "js-express":
    case "ts-hono":
    case "ts-nextjs": {
      const choice = pm && pm !== "auto" ? pm : "npm";
      const cmd = JS_PM[choice] || JS_PM.npm;
      return { cmd: cmd[0], args: cmd[1] || [] };
    }
    case "ts-elysia":
      return { cmd: "bun", args: ["install"] };
    case "python-fastapi":
    case "python-django": {
      const choice = pm && pm !== "auto" ? pm : "pip";
      switch (choice) {
        // `uv pip install -r ...` is the fastest drop-in for pip.
        case "uv":     return { cmd: "uv",     args: ["pip", "install", "-r", "requirements.txt"] };
        case "pdm":    return { cmd: "pdm",    args: ["install"] };
        case "poetry": return { cmd: "poetry", args: ["install"] };
        case "rye":    return { cmd: "rye",    args: ["sync"] };
        case "pip":
        default:       return { cmd: "pip",    args: ["install", "-r", "requirements.txt"] };
      }
    }
    case "java-spring-boot":
      return { cmd: "mvn", args: ["-q", "-B", "dependency:go-offline"] };
    case "php-slim":
      return { cmd: "composer", args: ["install"] };
    case "go-gin":
      return { cmd: "go", args: ["mod", "tidy"] };
    case "rust-axum":
      return { cmd: "cargo", args: ["fetch"] };
    case "ruby-sinatra":
      return { cmd: "bundle", args: ["install"] };
    case "csharp-aspnet":
      return { cmd: "dotnet", args: ["restore"] };
    case "kotlin-ktor":
      return { cmd: "gradle", args: ["--quiet", "build", "-x", "test"] };
    default:
      return null;
  }
}

/**
 * Best-effort install. Never throws — the generated project remains usable
 * even if the developer doesn't have the toolchain installed yet.
 */
export function runInstall(target, template, pm) {
  const spec = resolveInstallCommand(template, pm);
  if (!spec) return { ran: false };
  try {
    execSync([spec.cmd, ...spec.args].join(" "), { cwd: target, stdio: "ignore" });
    return { ran: true, ok: true };
  } catch (err) {
    return { ran: true, ok: false, error: err?.message || String(err) };
  }
}

/** Which lockfile or build-output to check if we want to know install ran. */
export function installArtifact(template) {
  switch (template) {
    case "js-express":
    case "ts-hono":
    case "ts-elysia":
    case "ts-nextjs":
      return "node_modules";
    case "go-gin":
      return "go.sum";
    case "rust-axum":
      return "Cargo.lock";
    case "ruby-sinatra":
      return "Gemfile.lock";
    case "csharp-aspnet":
      return "obj";
    default:
      return null;
  }
}

export function writeMetadata(target, payload) {
  fs.writeFileSync(
    path.join(target, ".polystack.json"),
    JSON.stringify({ version: 1, generatedAt: new Date().toISOString(), ...payload }, null, 2) + "\n"
  );
}
