import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import mri from "mri";
import kleur from "kleur";
import * as p from "@clack/prompts";
import {
  LANGUAGES,
  WEB_FRONTENDS,
  NATIVE_FRONTENDS,
  DATABASES,
  ORMS,
  DB_SETUPS,
  AUTH_PROVIDERS,
  PAYMENT_PROVIDERS,
  WEB_DEPLOYS,
  SERVER_DEPLOYS,
  PACKAGE_MANAGERS,
  ADDONS,
  findTemplate,
} from "./_vendor/stacks.js";
import { scaffold } from "./scaffold.js";
import { validateProjectName, safeTargetPath } from "./validate.js";
import { applyFeatures } from "./features.js";
import { runInstall, writeMetadata } from "./install.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveTemplatesDir() {
  if (process.env.POLYSTACK_TEMPLATES_DIR) return path.resolve(process.env.POLYSTACK_TEMPLATES_DIR);
  const bundled = path.resolve(__dirname, "..", "templates");
  if (fs.existsSync(bundled)) return bundled;
  return path.resolve(__dirname, "..", "..", "..", "packages", "templates");
}

function printBanner() {
  const line = kleur.bold().magenta;
  console.log();
  console.log(line("  ╭─────────────────────────────╮"));
  console.log(line("  │        ") + kleur.bold().white("P O L Y S T A C K") + line("    │"));
  console.log(line("  ╰─────────────────────────────╯"));
  console.log(kleur.dim("  Polyglot project scaffolder"));
  console.log();
}

class CLIError extends Error {
  constructor(message, { hint } = {}) {
    super(message);
    this.hint = hint;
  }
}

export async function run(argv) {
  const args = mri(argv, {
    alias: { h: "help", v: "version", y: "yes" },
    string: [
      "lang", "framework", "db", "name",
      "orm", "db-setup", "auth", "payments",
      "web-deploy", "server-deploy", "pm",
      "addons", "features",
    ],
    boolean: ["help", "version", "yes", "no-git", "no-install"],
  });

  if (args.help) return printHelp();
  if (args.version) return printVersion();

  try {
    await main(args);
  } catch (err) {
    if (err instanceof CLIError) {
      console.error(kleur.red(`\n✖ ${err.message}`));
      if (err.hint) console.error(kleur.dim(`  ${err.hint}`));
      process.exit(1);
    }
    throw err;
  }
}

async function main(args) {
  printBanner();

  const positional = args._?.[0];
  const addons = parseList(args.addons ?? args.features);

  let opts = {
    name: args.name || positional,
    lang: args.lang,
    webFrontend: args["web-frontend"],
    nativeFrontend: args["native-frontend"],
    framework: args.framework,
    db: args.db,
    orm: args.orm,
    dbSetup: args["db-setup"],
    auth: args.auth,
    payments: args.payments,
    webDeploy: args["web-deploy"],
    serverDeploy: args["server-deploy"],
    pm: args.pm,
    addons,
    // mri converts `--no-git` into `args.git === false`
    git: args.git === false || args["no-git"] ? "none" : "init",
    install: args.install === false || args["no-install"] ? "skip" : "install",
  };

  opts = await promptMissing(opts, !!args.yes);

  // --- Validation ---
  const v = validateProjectName(opts.name);
  if (!v.ok) throw new CLIError(v.error, { hint: "Use only [a-z0-9._-]." });
  opts.name = v.value;

  const lang = LANGUAGES.find((l) => l.id === opts.lang);
  if (!lang) {
    throw new CLIError(`Unknown language: ${opts.lang}`, {
      hint: `Available: ${LANGUAGES.map((l) => l.id).join(", ")}`,
    });
  }
  const fw = lang.frameworks.find((f) => f.id === opts.framework);
  if (!fw) {
    throw new CLIError(`Unknown framework for ${lang.id}: ${opts.framework}`, {
      hint: `Available: ${lang.frameworks.map((f) => f.id).join(", ")}`,
    });
  }
  if (opts.db && !DATABASES.some((d) => d.id === opts.db)) {
    throw new CLIError(`Unknown database: ${opts.db}`, {
      hint: `Available: ${DATABASES.map((d) => d.id).join(", ")}`,
    });
  }
  assertIn("--web-frontend", opts.webFrontend, WEB_FRONTENDS);
  assertIn("--native-frontend", opts.nativeFrontend, NATIVE_FRONTENDS);
  assertIn("ORM", opts.orm, ORMS);
  assertIn("--db-setup", opts.dbSetup, DB_SETUPS);
  assertIn("--auth", opts.auth, AUTH_PROVIDERS);
  assertIn("--payments", opts.payments, PAYMENT_PROVIDERS);
  assertIn("--web-deploy", opts.webDeploy, WEB_DEPLOYS);
  assertIn("--server-deploy", opts.serverDeploy, SERVER_DEPLOYS);
  assertIn("--pm", opts.pm, PACKAGE_MANAGERS);
  for (const a of opts.addons || []) {
    if (!ADDONS.some((x) => x.id === a)) {
      throw new CLIError(`Unknown addon: ${a}`, {
        hint: `Available: ${ADDONS.map((x) => x.id).join(", ")}`,
      });
    }
  }

  const template = findTemplate(opts.lang, opts.framework);
  const templateDir = path.join(resolveTemplatesDir(), template);
  if (!fs.existsSync(templateDir)) {
    throw new CLIError(`Template directory missing: ${templateDir}`);
  }

  const target = safeTargetPath(process.cwd(), opts.name);
  if (fs.existsSync(target) && fs.readdirSync(target).length > 0) {
    throw new CLIError(`Target directory "${opts.name}" exists and is not empty.`);
  }

  // --- Scaffold ---
  const s = p.spinner();
  s.start(`Scaffolding ${kleur.cyan(opts.name)} from ${kleur.yellow(template)}`);
  try {
    await scaffold({
      templateDir,
      target,
      vars: { PROJECT_NAME: opts.name, DB: opts.db || "none" },
    });

    // Addons that actually execute: docker, readme (handled by features.js).
    // Git init is controlled by the dedicated --no-git flag.
    const execFeatures = [
      ...(opts.addons || []).filter((a) => a === "docker" || a === "readme"),
      ...(opts.git === "init" ? ["git"] : []),
    ];
    applyFeatures({
      target,
      template,
      features: execFeatures,
      projectName: opts.name,
    });

    // Metadata for downstream tooling / future upgrades.
    writeMetadata(target, {
      name: opts.name,
      lang: opts.lang,
      webFrontend: opts.webFrontend || "none",
      nativeFrontend: opts.nativeFrontend || "none",
      framework: opts.framework,
      template,
      db: opts.db || "none",
      orm: opts.orm || "none",
      dbSetup: opts.dbSetup || "none",
      auth: opts.auth || "none",
      payments: opts.payments || "none",
      webDeploy: opts.webDeploy || "none",
      serverDeploy: opts.serverDeploy || "none",
      pm: opts.pm || "auto",
      addons: opts.addons || [],
      git: opts.git || "init",
    });
  } catch (err) {
    s.stop(kleur.red("✖ Scaffold failed"));
    try { fs.rmSync(target, { recursive: true, force: true }); } catch {}
    throw err;
  }
  s.stop(kleur.green("✓ Project created"));

  // --- Optional install step ---
  let installResult = null;
  if (opts.install === "install") {
    const is = p.spinner();
    is.start("Installing dependencies (best effort)");
    installResult = runInstall(target, template, opts.pm);
    if (!installResult.ran) is.stop(kleur.dim("↷ No install step for this stack"));
    else if (installResult.ok) is.stop(kleur.green("✓ Dependencies installed"));
    else is.stop(kleur.yellow("⚠ Install failed (you can run it manually)"));
  }

  // --- Next steps ---
  console.log();
  console.log(kleur.bold("Next steps:"));
  console.log(kleur.dim("  $ ") + kleur.cyan(`cd ${opts.name}`));
  const steps = nextStepsFor(template, opts);
  const installed = installResult?.ran && installResult?.ok;
  for (const cmd of steps) {
    // Skip the install command if we already ran it successfully.
    if (installed && /^(npm|pnpm|yarn|bun|pip|uv|pdm|poetry|rye|composer|bundle|go\s+mod|cargo\s+fetch|dotnet\s+restore|gradle\s+build|mvn\s+-q|python\s+-m\s+venv)/.test(cmd)) {
      continue;
    }
    console.log(kleur.dim("  $ ") + kleur.cyan(cmd));
  }
  printDeployHint(opts);

  // --- Summary line ---
  const bits = [
    opts.lang,
    opts.webFrontend && opts.webFrontend !== "none" && `web:${opts.webFrontend}`,
    opts.nativeFrontend && opts.nativeFrontend !== "none" && `native:${opts.nativeFrontend}`,
    opts.framework,
    `db=${opts.db || "none"}`,
    opts.orm && opts.orm !== "none" && `orm=${opts.orm}`,
    opts.auth && opts.auth !== "none" && `auth=${opts.auth}`,
    opts.payments && opts.payments !== "none" && `pay=${opts.payments}`,
    opts.webDeploy && opts.webDeploy !== "none" && `web→${opts.webDeploy}`,
    opts.serverDeploy && opts.serverDeploy !== "none" && `srv→${opts.serverDeploy}`,
    opts.addons?.length && `+${opts.addons.join(",")}`,
  ].filter(Boolean);
  console.log();
  console.log(kleur.dim("Stack: ") + bits.join(" / "));
  console.log();
}

function assertIn(label, value, list) {
  if (value == null) return;
  if (!list.some((x) => x.id === value)) {
    throw new CLIError(`Unknown value for ${label}: ${value}`, {
      hint: `Available: ${list.map((x) => x.id).join(", ")}`,
    });
  }
}

function parseList(raw) {
  if (raw == null) return undefined;
  if (Array.isArray(raw)) return raw.flatMap((v) => String(v).split(",")).filter(Boolean);
  return String(raw).split(",").map((x) => x.trim()).filter(Boolean);
}

async function promptMissing(opts, yes) {
  if (!opts.name) opts.name = await text("Project name?", "my-app");
  if (!opts.lang) {
    opts.lang = await select("Which language?", LANGUAGES.map((l) => ({ value: l.id, label: l.name })));
  }
  const lang = LANGUAGES.find((l) => l.id === opts.lang);
  if (!lang) throw new CLIError(`Unknown language: ${opts.lang}`);
  if (!opts.framework) {
    opts.framework = await select(
      `Which ${lang.name} framework?`,
      lang.frameworks.map((f) => ({ value: f.id, label: f.name }))
    );
  }
  if (!opts.db) {
    opts.db = yes ? "none" : await select("Which database?", DATABASES.map((d) => ({ value: d.id, label: d.name })));
  }
  if (!opts.addons) {
    opts.addons = yes ? [] : await multiselect("Extras?", ADDONS.map((f) => ({ value: f.id, label: f.name })));
  }
  // Defaults for everything else when `--yes`.
  if (yes) {
    opts.webFrontend ??= "none";
    opts.nativeFrontend ??= "none";
    opts.orm ??= "none";
    opts.dbSetup ??= "none";
    opts.auth ??= "none";
    opts.payments ??= "none";
    opts.webDeploy ??= "none";
    opts.serverDeploy ??= "none";
    opts.pm ??= "auto";
  }
  return opts;
}

async function text(message, initial) {
  const v = await p.text({ message, initialValue: initial });
  if (p.isCancel(v)) { p.cancel("Cancelled."); process.exit(0); }
  return String(v).trim();
}
async function select(message, options) {
  const v = await p.select({ message, options });
  if (p.isCancel(v)) { p.cancel("Cancelled."); process.exit(0); }
  return v;
}
async function multiselect(message, options) {
  const v = await p.multiselect({ message, options, required: false });
  if (p.isCancel(v)) { p.cancel("Cancelled."); process.exit(0); }
  return v;
}

function pythonInstallSteps(pm) {
  switch (pm) {
    case "uv":     return ["uv venv", "uv pip install -r requirements.txt"];
    case "pdm":    return ["pdm install"];
    case "poetry": return ["poetry install"];
    case "rye":    return ["rye sync"];
    case "pip":
    default:       return ["python -m venv .venv", "pip install -r requirements.txt"];
  }
}

function nextStepsFor(template, opts) {
  // Pick the right JS package manager if the user picked a Python one (or vice versa).
  const jsPms = new Set(["npm", "pnpm", "yarn", "bun"]);
  const pm = opts?.pm && opts.pm !== "auto" && jsPms.has(opts.pm) ? opts.pm : "npm";
  const nodeInstall = pm === "bun" ? "bun install" : pm === "yarn" ? "yarn" : `${pm} install`;
  const nodeDev = pm === "bun" ? "bun run dev" : pm === "yarn" ? "yarn dev" : `${pm} run dev`;
  switch (template) {
    case "java-spring-boot": return ["mvn spring-boot:run"];
    case "python-fastapi":   return [...pythonInstallSteps(opts?.pm), "uvicorn app.main:app --reload"];
    case "python-django":    return [...pythonInstallSteps(opts?.pm), "python manage.py runserver"];
    case "js-express":       return [nodeInstall, nodeDev];
    case "ts-hono":          return [nodeInstall, nodeDev];
    case "ts-elysia":        return ["bun install", "bun run dev"];
    case "ts-nextjs":        return [nodeInstall, nodeDev];
    case "php-slim":         return ["composer install", "php -S localhost:8000 -t public"];
    case "go-gin":           return ["go mod tidy", "go run ."];
    case "rust-axum":        return ["cargo run"];
    case "ruby-sinatra":     return ["bundle install", "bundle exec rackup"];
    case "csharp-aspnet":    return ["dotnet run"];
    case "kotlin-ktor":      return ["gradle run"];
    default:                 return [];
  }
}

function printDeployHint(opts) {
  const hints = [];
  if (opts.webDeploy && opts.webDeploy !== "none") {
    hints.push(`Web deploy → ${opts.webDeploy} (configure via the provider's CLI/dashboard).`);
  }
  if (opts.serverDeploy && opts.serverDeploy !== "none") {
    hints.push(`Server deploy → ${opts.serverDeploy}.`);
  }
  if (opts.auth && opts.auth !== "none") hints.push(`Auth: ${opts.auth} — add SDK of choice.`);
  if (opts.payments && opts.payments !== "none") hints.push(`Payments: ${opts.payments} — add SDK of choice.`);
  if (!hints.length) return;
  console.log();
  console.log(kleur.bold("Integrations recorded in .polystack.json:"));
  hints.forEach((h) => console.log(kleur.dim("  • ") + h));
}

function printVersion() {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));
  console.log(pkg.version);
}

function printHelp() {
  console.log(`
${kleur.bold("create-polystack")} — scaffold polyglot projects

${kleur.bold("Usage:")}
  npx create-polystack@latest <name> [options]

${kleur.bold("Core:")}
  --lang            java | python | javascript | typescript | php | go | rust | ruby | csharp | kotlin
  --framework       spring-boot | fastapi | django | express | hono | elysia | nextjs | slim | gin | axum | sinatra | aspnet | ktor
                    (this is the ${kleur.bold("backend")} framework)
  --web-frontend    nextjs | react-vite | react-router | tanstack-start | nuxt | sveltekit | solid-start | astro | none
  --native-frontend react-native-expo | react-native-nativewind | react-native-unistyles | flutter | swift-ui | kotlin-compose | lynx | none
  --db              none | postgres | mysql | sqlite | mongodb

${kleur.bold("Integrations (metadata, recorded in .polystack.json):")}
  --orm             drizzle | prisma | typeorm | sqlalchemy | django-orm | hibernate | gorm | diesel | active-record | ef-core | exposed | eloquent | none
  --db-setup        docker | neon | supabase | turso | planetscale | mongodb-atlas | none
  --auth            better-auth | clerk | auth0 | supabase-auth | next-auth | lucia | none
  --payments        stripe | polar | paddle | lemon-squeezy | none
  --web-deploy      vercel | netlify | cloudflare-pages | github-pages | none
  --server-deploy   railway | fly | render | cloud-run | aws-apprunner | none

${kleur.bold("Workflow:")}
  --pm              npm | pnpm | yarn | bun                (JS/TS)
                    uv | pdm | poetry | rye | pip           (Python)
                    auto                                    (use language default)
  --addons          docker,readme,env-example,husky,biome,prettier,github-actions
  --no-git          skip git init
  --no-install      skip auto-install
  -y, --yes         accept defaults for optional prompts
  -h, --help        show this help
  -v, --version     print version

${kleur.bold("Examples:")}
  npx create-polystack@latest my-api --lang python --framework fastapi --db postgres --db-setup neon --auth clerk
  npx create-polystack@latest shop   --lang java   --framework spring-boot --db mysql --orm hibernate --addons docker
  npx create-polystack@latest site   --lang typescript --framework nextjs --pm pnpm --web-deploy vercel
`);
}
