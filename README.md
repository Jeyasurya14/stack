# Polystack

A polyglot stack builder — like `better-t-stack`, but not limited to TypeScript.
Pick a language (**Java, Python, JavaScript, TypeScript, PHP**), a framework, a database, optional extras (Docker / git / README), and scaffold a ready-to-run project with one command.

[![CI](https://github.com/your-org/polystack/actions/workflows/ci.yml/badge.svg)](./.github/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

## Monorepo layout

```
apps/
  web/       Next.js stack-builder UI → outputs a copy-paste command
  cli/       Node CLI scaffolder (published as `create-polystack`)
packages/
  core/      Shared stack registry (LANGUAGES / FRAMEWORKS / DATABASES)
  templates/ Starter templates per language/framework
```

## Requirements

- **Node.js ≥ 18** (recommended 20 or 22)
- **pnpm ≥ 9** — if you don't have it, use `npx pnpm@9 <cmd>` or enable via `corepack enable` (may need admin on Windows)

## Quick start (dev)

```bash
npx pnpm@9 install

# run the web builder
npx pnpm@9 web            # → http://localhost:3000

# run the CLI interactively
npx pnpm@9 cli

# run the CLI with flags
node apps/cli/bin/index.js my-api --lang python --framework fastapi --db postgres --yes
```

> **Note for Windows + pnpm:** `pnpm <script> -- --flag` doesn't always forward flags correctly through PowerShell. Call the CLI directly via `node apps/cli/bin/index.js <args>` when passing flags.

## Usage (end user)

```bash
npx create-polystack@latest my-api \
  --lang python --framework fastapi --db postgres \
  --features docker,git
```

All options:

| Flag          | Values                                                       |
|---------------|--------------------------------------------------------------|
| `--lang`      | `java`, `python`, `javascript`, `typescript`, `php`          |
| `--framework` | `spring-boot`, `fastapi`, `django`, `express`, `hono`, `nextjs`, `slim` |
| `--db`        | `none`, `postgres`, `mysql`, `sqlite`, `mongodb`             |
| `--features`  | any of `docker,git,readme` (comma-separated)                 |
| `-y, --yes`   | Skip optional prompts                                        |

## Supported stacks (MVP)

| Language   | Frameworks         | Template id              |
|------------|--------------------|--------------------------|
| Java       | Spring Boot        | `java-spring-boot`       |
| Python     | FastAPI, Django    | `python-fastapi`, `python-django` |
| JavaScript | Express            | `js-express`             |
| TypeScript | Hono, Next.js 14   | `ts-hono`, `ts-nextjs`   |
| PHP        | Slim 4             | `php-slim`               |

Adding more: drop a folder in `packages/templates/<id>/` and register it in `packages/core/src/stacks.js`. Both the web UI and the CLI pick it up automatically.

## How it works

1. User picks options in the web UI (or via CLI prompts).
2. Web UI outputs a command like `npx create-polystack@latest my-app --lang java --framework spring-boot --db postgres`.
3. CLI validates inputs, copies the matching template from `packages/templates/`, rewrites `{{PROJECT_NAME}}` / `{{DB}}`, renames `_gitignore` → `.gitignore`, applies optional features (Docker / git init / README), and prints the next-step commands for that stack.

## Production considerations baked in

- **Publishable CLI:** `create-polystack` ships templates via a `prepack` hook (`apps/cli/scripts/prepack.mjs`) that copies `packages/templates/` into the package before `npm publish`, so the installed CLI is self-contained. `postpack` cleans it up.
- **Template resolution:** `POLYSTACK_TEMPLATES_DIR` env var overrides the templates location (useful for testing and forks).
- **Security:** project-name validation rejects path separators and reserved names; scaffold refuses to write outside the CWD; symlinks inside templates are not followed.
- **Portability:** files are copied binary-safe, text placeholders only replace in UTF-8 files, file modes are preserved when possible.
- **Cross-platform CI:** GitHub Actions matrix tests Node 18/20/22 on Ubuntu + Windows, including a real scaffold smoke test.
- **Tests:** `vitest` covers the stack registry, name validation, and scaffold/placeholder behavior.
- **DX:** `.editorconfig`, `.prettierrc`, `.nvmrc`, `.npmrc` committed.

## Scripts

```bash
pnpm web           # dev server for the builder UI
pnpm cli           # run the CLI
pnpm test          # run all tests (vitest across workspaces)
pnpm build:web     # production Next.js build
pnpm format        # prettier --write
pnpm lint:format   # prettier --check
```

## License

MIT — see [LICENSE](./LICENSE).
