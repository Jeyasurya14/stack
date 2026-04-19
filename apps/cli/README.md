# create-polystack

Scaffold polyglot projects in one command. Pick a language, backend framework,
database, ORM, auth, payments, deployment target, and more — copy the
generated command, run it, done.

```bash
npx create-polystack@latest my-app
```

## Interactive

```bash
npx create-polystack@latest
```

Walks you through language → framework → database → addons.

## Non-interactive (full stack)

```bash
npx create-polystack@latest my-api \
  --lang python --framework fastapi --db postgres \
  --orm sqlalchemy --db-setup neon \
  --auth clerk --payments stripe \
  --web-deploy vercel --server-deploy fly \
  --pm uv \
  --addons docker,readme,github-actions
```

## Supported stacks

**Languages:** Java, Python, JavaScript, TypeScript, PHP, Go, Rust, Ruby, C#, Kotlin

**Backends:** Spring Boot, FastAPI, Django, Express, Hono, Next.js API, Slim, Gin, Axum, Sinatra, ASP.NET Minimal, Ktor

**Web frontends:** Next.js, React + Vite, React Router, TanStack Start, Nuxt, SvelteKit, SolidStart, Astro

**Native frontends:** React Native (Expo/NativeWind/Unistyles), Flutter, SwiftUI, Compose Multiplatform, Lynx

**Databases:** PostgreSQL, MySQL, SQLite, MongoDB, or none

**ORMs:** Prisma, Drizzle, TypeORM, SQLAlchemy, Django ORM, Hibernate, GORM, Diesel, ActiveRecord, EF Core, Exposed, Eloquent

**DB setup:** Docker Compose, Neon, Supabase, Turso, PlanetScale, MongoDB Atlas

**Auth:** Better-Auth, Clerk, Auth0, Supabase Auth, NextAuth, Lucia

**Payments:** Stripe, Polar, Paddle, Lemon Squeezy

**Web deploy:** Vercel, Netlify, Cloudflare Pages, GitHub Pages

**Server deploy:** Railway, Fly.io, Render, Cloud Run, AWS App Runner

**Package managers:** npm, pnpm, yarn, bun (JS/TS) · uv, pdm, poetry, rye, pip (Python)

**Addons:** Dockerfile, README, `.env.example`, GitHub Actions, Husky, Biome, Prettier

## Options

Run `npx create-polystack@latest --help` for the full flag reference.

Key flags:

| Flag | Purpose |
|---|---|
| `--yes` | Accept defaults for optional prompts |
| `--no-git` | Skip `git init` |
| `--no-install` | Skip the auto-install step |

## What gets generated

Every scaffolded project contains:

- Runnable source for the chosen backend (and optional frontend/native)
- A language-appropriate `Dockerfile` if you picked that addon
- A `.polystack.json` metadata file recording every choice (for future tooling)
- Initialized git repo (unless `--no-git`)
- Installed dependencies using your chosen package manager (unless `--no-install`)

## License

MIT © 2026
