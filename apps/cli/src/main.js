import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import mri from "mri";
import kleur from "kleur";
import * as p from "@clack/prompts";
import { LANGUAGES, DATABASES, FEATURES, findTemplate } from "@polystack/core/stacks";
import { scaffold } from "./scaffold.js";
import { validateProjectName, safeTargetPath } from "./validate.js";
import { applyFeatures } from "./features.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Resolve the templates directory in a way that works both in the monorepo
 * (dev) and when the CLI is published (templates bundled into the package).
 * Priority:
 *   1. $POLYSTACK_TEMPLATES_DIR
 *   2. ./templates co-located with the installed package
 *   3. ../../../packages/templates (monorepo dev)
 */
function resolveTemplatesDir() {
  if (process.env.POLYSTACK_TEMPLATES_DIR) {
    return path.resolve(process.env.POLYSTACK_TEMPLATES_DIR);
  }
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
    string: ["lang", "framework", "db", "features", "name"],
    boolean: ["help", "version", "yes"],
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
  let opts = {
    name: args.name || positional,
    lang: args.lang,
    framework: args.framework,
    db: args.db,
    features: parseFeatures(args.features),
  };

  opts = await promptMissing(opts, !!args.yes);

  // Validate name
  const v = validateProjectName(opts.name);
  if (!v.ok) throw new CLIError(v.error, { hint: "Use only [a-z0-9._-]." });
  opts.name = v.value;

  // Validate language + framework against registry
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

  const template = findTemplate(opts.lang, opts.framework);
  const templatesDir = resolveTemplatesDir();
  const templateDir = path.join(templatesDir, template);
  if (!fs.existsSync(templateDir)) {
    throw new CLIError(`Template directory missing: ${templateDir}`, {
      hint: "Set POLYSTACK_TEMPLATES_DIR or reinstall the CLI.",
    });
  }

  // Validate db
  if (opts.db && !DATABASES.some((d) => d.id === opts.db)) {
    throw new CLIError(`Unknown database: ${opts.db}`, {
      hint: `Available: ${DATABASES.map((d) => d.id).join(", ")}`,
    });
  }

  // Validate features
  for (const f of opts.features || []) {
    if (!FEATURES.some((x) => x.id === f)) {
      throw new CLIError(`Unknown feature: ${f}`, {
        hint: `Available: ${FEATURES.map((x) => x.id).join(", ")}`,
      });
    }
  }

  const target = safeTargetPath(process.cwd(), opts.name);
  if (fs.existsSync(target) && fs.readdirSync(target).length > 0) {
    throw new CLIError(`Target directory "${opts.name}" exists and is not empty.`);
  }

  const s = p.spinner();
  s.start(`Scaffolding ${kleur.cyan(opts.name)} from ${kleur.yellow(template)}`);
  try {
    await scaffold({
      templateDir,
      target,
      vars: {
        PROJECT_NAME: opts.name,
        DB: opts.db || "none",
      },
    });
    applyFeatures({
      target,
      template,
      features: opts.features || [],
      projectName: opts.name,
    });
  } catch (err) {
    s.stop(kleur.red("✖ Scaffold failed"));
    // Clean up partial directory
    try { fs.rmSync(target, { recursive: true, force: true }); } catch {}
    throw err;
  }
  s.stop(kleur.green("✓ Project created"));

  console.log();
  console.log(kleur.bold("Next steps:"));
  console.log(kleur.dim("  $ ") + kleur.cyan(`cd ${opts.name}`));
  nextStepsFor(template).forEach((cmd) =>
    console.log(kleur.dim("  $ ") + kleur.cyan(cmd))
  );
  console.log();
  console.log(
    kleur.dim("Stack: ") +
      `${opts.lang} / ${opts.framework} / db=${opts.db || "none"}` +
      (opts.features?.length ? ` / +${opts.features.join(",")}` : "")
  );
  console.log();
}

function parseFeatures(raw) {
  if (raw == null) return undefined;
  if (Array.isArray(raw)) return raw.flatMap((v) => String(v).split(",")).filter(Boolean);
  return String(raw).split(",").map((x) => x.trim()).filter(Boolean);
}

async function promptMissing(opts, yes) {
  if (!opts.name) {
    opts.name = await text("Project name?", "my-app");
  }
  if (!opts.lang) {
    opts.lang = await select(
      "Which language?",
      LANGUAGES.map((l) => ({ value: l.id, label: l.name }))
    );
  }
  const lang = LANGUAGES.find((l) => l.id === opts.lang);
  if (!lang) {
    throw new CLIError(`Unknown language: ${opts.lang}`, {
      hint: `Available: ${LANGUAGES.map((l) => l.id).join(", ")}`,
    });
  }
  if (!opts.framework) {
    opts.framework = await select(
      `Which ${lang.name} framework?`,
      lang.frameworks.map((f) => ({ value: f.id, label: f.name }))
    );
  }
  if (!opts.db) {
    opts.db = yes
      ? "none"
      : await select(
          "Which database?",
          DATABASES.map((d) => ({ value: d.id, label: d.name }))
        );
  }
  if (!opts.features) {
    opts.features = yes
      ? []
      : await multiselect(
          "Extra features?",
          FEATURES.map((f) => ({ value: f.id, label: f.name }))
        );
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

function nextStepsFor(template) {
  switch (template) {
    case "java-spring-boot":
      return ["mvn spring-boot:run"];
    case "python-fastapi":
      return [
        "python -m venv .venv",
        "pip install -r requirements.txt",
        "uvicorn app.main:app --reload",
      ];
    case "python-django":
      return [
        "python -m venv .venv",
        "pip install -r requirements.txt",
        "python manage.py runserver",
      ];
    case "js-express":
      return ["npm install", "npm run dev"];
    case "ts-hono":
      return ["npm install", "npm run dev"];
    case "ts-nextjs":
      return ["npm install", "npm run dev"];
    case "php-slim":
      return ["composer install", "php -S localhost:8000 -t public"];
    default:
      return [];
  }
}

function printVersion() {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8")
  );
  console.log(pkg.version);
}

function printHelp() {
  console.log(`
${kleur.bold("create-polystack")} — scaffold polyglot projects

${kleur.bold("Usage:")}
  npx create-polystack@latest <name> [options]

${kleur.bold("Options:")}
  --lang        java | python | javascript | typescript | php
  --framework   spring-boot | fastapi | django | express | hono | nextjs | slim
  --db          none | postgres | mysql | sqlite | mongodb
  --features    docker,git,readme    (comma-separated)
  -y, --yes     skip optional prompts (use defaults)
  -h, --help    show this help
  -v, --version print version

${kleur.bold("Examples:")}
  npx create-polystack@latest my-api --lang python --framework fastapi --db postgres
  npx create-polystack@latest shop   --lang java   --framework spring-boot --db mysql --features docker,git
  npx create-polystack@latest site   --lang typescript --framework nextjs
`);
}
