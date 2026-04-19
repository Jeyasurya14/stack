// Polystack — source of truth for supported stack options.
// Consumed by both the web builder (apps/web) and the CLI (apps/cli).

export const LANGUAGES = [
  { id: "java", name: "Java", color: "#f59e0b", description: "Enterprise-grade JVM language", frameworks: [
    { id: "spring-boot", name: "Spring Boot", template: "java-spring-boot", description: "Production-grade REST APIs with autoconfig" },
  ]},
  { id: "python", name: "Python", color: "#22d3ee", description: "Batteries-included dynamic language", frameworks: [
    { id: "fastapi", name: "FastAPI", template: "python-fastapi", description: "Modern async APIs with automatic OpenAPI docs" },
    { id: "django", name: "Django", template: "python-django", description: "Full-stack framework with ORM & admin" },
  ]},
  { id: "javascript", name: "JavaScript", color: "#facc15", description: "The language of the web", frameworks: [
    { id: "express", name: "Express", template: "js-express", description: "Minimalist, unopinionated Node.js server" },
  ]},
  { id: "typescript", name: "TypeScript", color: "#60a5fa", description: "Typed superset of JavaScript", frameworks: [
    { id: "hono", name: "Hono", template: "ts-hono", description: "Ultrafast edge-ready web framework" },
    { id: "elysia", name: "Elysia", template: "ts-elysia", description: "Bun-native TypeScript framework with end-to-end type safety" },
    { id: "nextjs", name: "Next.js", template: "ts-nextjs", description: "React framework for the modern web" },
  ]},
  { id: "php", name: "PHP", color: "#a78bfa", description: "Dynamic language powering much of the web", frameworks: [
    { id: "slim", name: "Slim", template: "php-slim", description: "Micro-framework for PHP APIs" },
  ]},
  { id: "go", name: "Go", color: "#38bdf8", description: "Fast, compiled, concurrent language from Google", frameworks: [
    { id: "gin", name: "Gin", template: "go-gin", description: "High-performance HTTP web framework" },
  ]},
  { id: "rust", name: "Rust", color: "#fb923c", description: "Blazing-fast, memory-safe systems language", frameworks: [
    { id: "axum", name: "Axum", template: "rust-axum", description: "Ergonomic async web framework by Tokio" },
  ]},
  { id: "ruby", name: "Ruby", color: "#f43f5e", description: "Elegant, developer-friendly scripting language", frameworks: [
    { id: "sinatra", name: "Sinatra", template: "ruby-sinatra", description: "Tiny, DSL-first Ruby web framework" },
  ]},
  { id: "csharp", name: "C#", color: "#a855f7", description: "Modern, statically-typed .NET language", frameworks: [
    { id: "aspnet", name: "ASP.NET Minimal", template: "csharp-aspnet", description: ".NET 8 minimal Web API" },
  ]},
  { id: "kotlin", name: "Kotlin", color: "#34d399", description: "Modern, pragmatic JVM language", frameworks: [
    { id: "ktor", name: "Ktor", template: "kotlin-ktor", description: "Async Kotlin framework from JetBrains" },
  ]},
];

/** Web frontend frameworks (independent of the backend language choice). */
export const WEB_FRONTENDS = [
  { id: "none", name: "None", description: "Backend-only project — no web frontend" },
  { id: "nextjs", name: "Next.js", description: "React framework for the modern web" },
  { id: "react-vite", name: "React + Vite", description: "Fast SPA with Vite dev server" },
  { id: "react-router", name: "React Router", description: "React Router v7 (formerly Remix)" },
  { id: "tanstack-start", name: "TanStack Start", description: "Type-safe React meta-framework" },
  { id: "nuxt", name: "Nuxt", description: "Vue 3 meta-framework with SSR" },
  { id: "sveltekit", name: "SvelteKit", description: "Svelte application framework" },
  { id: "solid-start", name: "SolidStart", description: "SolidJS meta-framework" },
  { id: "astro", name: "Astro", description: "Content-focused with islands architecture" },
];

/** Native/mobile frontend frameworks. */
export const NATIVE_FRONTENDS = [
  { id: "none", name: "None", description: "No native/mobile frontend" },
  { id: "react-native-expo", name: "React Native (Expo)", description: "Cross-platform with Expo toolchain" },
  { id: "react-native-nativewind", name: "RN + NativeWind", description: "React Native with Tailwind styling" },
  { id: "react-native-unistyles", name: "RN + Unistyles", description: "React Native with Unistyles" },
  { id: "flutter", name: "Flutter", description: "Google's cross-platform UI toolkit" },
  { id: "swift-ui", name: "SwiftUI", description: "Apple-native UI (iOS/macOS)" },
  { id: "kotlin-compose", name: "Compose Multiplatform", description: "Kotlin UI for Android/desktop/web" },
  { id: "lynx", name: "Lynx", description: "ByteDance's cross-platform engine" },
];

export const DATABASES = [
  { id: "none", name: "None", description: "Skip database setup" },
  { id: "postgres", name: "PostgreSQL", description: "Advanced open-source SQL database" },
  { id: "mysql", name: "MySQL", description: "Popular relational database" },
  { id: "sqlite", name: "SQLite", description: "File-based embedded database" },
  { id: "mongodb", name: "MongoDB", description: "Document-oriented NoSQL database" },
];

/** ORMs with language scoping. `langs: null` means universal. */
export const ORMS = [
  { id: "none", name: "None", description: "Skip ORM — use a driver directly", langs: null },
  { id: "prisma", name: "Prisma", description: "Type-safe next-gen ORM", langs: ["typescript", "javascript"] },
  { id: "drizzle", name: "Drizzle", description: "Lightweight TypeScript ORM", langs: ["typescript", "javascript"] },
  { id: "typeorm", name: "TypeORM", description: "Decorator-based TypeScript ORM", langs: ["typescript", "javascript"] },
  { id: "sqlalchemy", name: "SQLAlchemy", description: "Python SQL toolkit & ORM", langs: ["python"] },
  { id: "django-orm", name: "Django ORM", description: "Built-in Django ORM", langs: ["python"] },
  { id: "hibernate", name: "Hibernate", description: "Java persistence framework", langs: ["java"] },
  { id: "gorm", name: "GORM", description: "Idiomatic ORM for Go", langs: ["go"] },
  { id: "diesel", name: "Diesel", description: "Safe, extensible Rust ORM", langs: ["rust"] },
  { id: "active-record", name: "ActiveRecord", description: "Ruby on Rails' ORM", langs: ["ruby"] },
  { id: "ef-core", name: "EF Core", description: ".NET Entity Framework", langs: ["csharp"] },
  { id: "exposed", name: "Exposed", description: "Kotlin SQL framework from JetBrains", langs: ["kotlin"] },
  { id: "eloquent", name: "Eloquent", description: "Laravel's expressive ORM", langs: ["php"] },
];

export const DB_SETUPS = [
  { id: "none", name: "Basic", description: "No cloud integration — connect it yourself" },
  { id: "docker", name: "Docker Compose", description: "Run the DB locally via docker compose" },
  { id: "neon", name: "Neon", description: "Serverless Postgres with branching", dbs: ["postgres"] },
  { id: "supabase", name: "Supabase", description: "Open-source Firebase alternative", dbs: ["postgres"] },
  { id: "turso", name: "Turso", description: "Distributed SQLite with edge replicas", dbs: ["sqlite"] },
  { id: "planetscale", name: "PlanetScale", description: "MySQL on NVMe with branching", dbs: ["mysql"] },
  { id: "mongodb-atlas", name: "MongoDB Atlas", description: "Managed MongoDB clusters", dbs: ["mongodb"] },
];

export const AUTH_PROVIDERS = [
  { id: "none", name: "None", description: "Skip authentication" },
  { id: "better-auth", name: "Better-Auth", description: "Full-featured TypeScript auth" },
  { id: "clerk", name: "Clerk", description: "Complete user management" },
  { id: "auth0", name: "Auth0", description: "Enterprise identity platform" },
  { id: "supabase-auth", name: "Supabase Auth", description: "Included with Supabase" },
  { id: "next-auth", name: "NextAuth", description: "For Next.js applications" },
  { id: "lucia", name: "Lucia", description: "Auth library for TypeScript" },
];

export const PAYMENT_PROVIDERS = [
  { id: "none", name: "None", description: "Skip payments integration" },
  { id: "stripe", name: "Stripe", description: "Payments infrastructure" },
  { id: "polar", name: "Polar", description: "Monetize software in a few lines" },
  { id: "paddle", name: "Paddle", description: "Merchant of Record for SaaS" },
  { id: "lemon-squeezy", name: "Lemon Squeezy", description: "Global payments & tax handling" },
];

export const WEB_DEPLOYS = [
  { id: "none", name: "None", description: "Skip web-deploy setup" },
  { id: "vercel", name: "Vercel", description: "Next.js creators' platform" },
  { id: "netlify", name: "Netlify", description: "JAMstack deployment" },
  { id: "cloudflare-pages", name: "Cloudflare Pages", description: "Edge-native static hosting" },
  { id: "github-pages", name: "GitHub Pages", description: "Static hosting from git" },
];

export const SERVER_DEPLOYS = [
  { id: "none", name: "None", description: "Skip server-deploy setup" },
  { id: "railway", name: "Railway", description: "Zero-config deploys from git" },
  { id: "fly", name: "Fly.io", description: "Run globally distributed apps" },
  { id: "render", name: "Render", description: "Unified cloud for web services" },
  { id: "cloud-run", name: "Google Cloud Run", description: "Serverless containers" },
  { id: "aws-apprunner", name: "AWS App Runner", description: "Container service on AWS" },
];

export const PACKAGE_MANAGERS = [
  { id: "auto", name: "Auto", description: "Use the default for your language" },
  // JavaScript / TypeScript
  { id: "npm", name: "npm", description: "Node default", langs: ["javascript", "typescript"] },
  { id: "pnpm", name: "pnpm", description: "Fast, disk-efficient", langs: ["javascript", "typescript"] },
  { id: "yarn", name: "yarn", description: "Reliable and fast", langs: ["javascript", "typescript"] },
  { id: "bun", name: "bun", description: "All-in-one toolkit", langs: ["javascript", "typescript"] },
  // Python — faster-than-pip alternatives
  { id: "uv", name: "uv", description: "10–100× faster, Rust-based (Astral)", langs: ["python"] },
  { id: "pdm", name: "pdm", description: "Modern, PEP 582 package manager", langs: ["python"] },
  { id: "poetry", name: "Poetry", description: "Dependency & packaging manager", langs: ["python"] },
  { id: "rye", name: "Rye", description: "Opinionated workflow from Astral", langs: ["python"] },
  { id: "pip", name: "pip", description: "Python default", langs: ["python"] },
];

/** Addons are standalone things you can toggle. Some (docker, readme) are
 * actually executed by the CLI. Others are recorded in .polystack.json
 * for downstream tooling.
 */
export const ADDONS = [
  { id: "docker", name: "Dockerfile", description: "Language-appropriate production Dockerfile" },
  { id: "readme", name: "README", description: "Ensure a README.md exists" },
  { id: "env-example", name: ".env.example", description: "Sample environment file" },
  { id: "github-actions", name: "GitHub Actions", description: "CI workflow for tests & build" },
  { id: "husky", name: "Husky", description: "Git hooks made easy" },
  { id: "biome", name: "Biome", description: "Fast formatter & linter" },
  { id: "prettier", name: "Prettier", description: "Opinionated code formatter" },
];

export const GIT_OPTIONS = [
  { id: "init", name: "Git init", description: "Initialize repo with an initial commit" },
  { id: "none", name: "No Git", description: "Skip git initialization" },
];

export const INSTALL_OPTIONS = [
  { id: "install", name: "Install dependencies", description: "Auto-run the package install step" },
  { id: "skip", name: "Skip install", description: "Install dependencies manually later" },
];

/** Legacy alias kept for backward compatibility with the earlier API. */
export const FEATURES = [
  ...ADDONS,
  { id: "git", name: "Git init", description: "Initialize a git repo with an initial commit" },
];

export function findTemplate(langId, frameworkId) {
  const lang = LANGUAGES.find((l) => l.id === langId);
  if (!lang) return null;
  const fw = lang.frameworks.find((f) => f.id === frameworkId);
  return fw ? fw.template : null;
}

/**
 * Produce a copy-pasteable shell command. Only emits flags whose value
 * differs from the sensible default so the output stays clean.
 */
export function buildCommand(opts) {
  const {
    name,
    lang,
    webFrontend,
    nativeFrontend,
    framework,
    db,
    orm,
    dbSetup,
    auth,
    payments,
    webDeploy,
    serverDeploy,
    pm,
    addons,
    git,
    install,
    // Legacy alias (kept for backwards compat with early callers).
    features,
  } = opts || {};
  const parts = ["npx", "create-polystack@latest", name || "my-app"];
  if (lang) parts.push("--lang", lang);
  if (webFrontend && webFrontend !== "none") parts.push("--web-frontend", webFrontend);
  if (nativeFrontend && nativeFrontend !== "none") parts.push("--native-frontend", nativeFrontend);
  if (framework) parts.push("--framework", framework);
  if (db && db !== "none") parts.push("--db", db);
  if (orm && orm !== "none") parts.push("--orm", orm);
  if (dbSetup && dbSetup !== "none") parts.push("--db-setup", dbSetup);
  if (auth && auth !== "none") parts.push("--auth", auth);
  if (payments && payments !== "none") parts.push("--payments", payments);
  if (webDeploy && webDeploy !== "none") parts.push("--web-deploy", webDeploy);
  if (serverDeploy && serverDeploy !== "none") parts.push("--server-deploy", serverDeploy);
  if (pm && pm !== "auto") parts.push("--pm", pm);
  const addonList = addons && addons.length ? addons : features;
  if (addonList && addonList.length) parts.push("--addons", addonList.join(","));
  if (git === "none" || git === false) parts.push("--no-git");
  if (install === "skip" || install === false) parts.push("--no-install");
  return parts.join(" ");
}
