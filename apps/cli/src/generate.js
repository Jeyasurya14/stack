/**
 * generate.js — Post-scaffold stack-aware code injection.
 *
 * Called right after the base template is copied to `target`.
 * Patches package.json / requirements.txt and writes stack-specific
 * source files (db connection, ORM config, models, routes, .env.example).
 */

import fs from "node:fs";
import path from "node:path";

// ─────────────────────────────────────────────────────────────────────────────
// Low-level helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Write a file, creating parent dirs. Always overwrites (target is freshly scaffolded). */
function write(target, rel, content) {
  const abs = path.join(target, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content.replace(/^\n/, ""), "utf8");
}

function readJsonSafe(p) {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; }
}

/** Merge extra deps/scripts into package.json — non-destructive. */
function patchPkg(target, { deps = {}, dev = {}, scripts = {} } = {}) {
  const fp = path.join(target, "package.json");
  const pkg = readJsonSafe(fp);
  if (!pkg) return;
  pkg.dependencies    = sortObj({ ...pkg.dependencies,    ...deps });
  pkg.devDependencies = sortObj({ ...pkg.devDependencies, ...dev });
  pkg.scripts         = { ...pkg.scripts, ...scripts };
  fs.writeFileSync(fp, JSON.stringify(pkg, null, 2) + "\n", "utf8");
}

function sortObj(o) {
  return Object.fromEntries(Object.entries(o || {}).sort(([a], [b]) => a.localeCompare(b)));
}

/** Append pip packages that aren't already listed in requirements.txt. */
function appendReqs(target, pkgs) {
  const fp = path.join(target, "requirements.txt");
  const cur = fs.existsSync(fp) ? fs.readFileSync(fp, "utf8") : "";
  const need = pkgs.filter(p => {
    const name = p.split(/[><=![\s]/)[0].toLowerCase();
    return !cur.toLowerCase().includes(name);
  });
  if (!need.length) return;
  fs.writeFileSync(fp, cur.trimEnd() + "\n" + need.join("\n") + "\n", "utf8");
}

/** Write / append .env.example (skips duplicate keys). */
function writeEnvExample(target, entries, opts = {}) {
  const fp = path.join(target, ".env.example");
  const cur = fs.existsSync(fp) ? fs.readFileSync(fp, "utf8") : "";
  const all = [
    ...entries,
    ...authEnvVars(opts.auth),
    ...paymentEnvVars(opts.payments),
    ["PORT", "3000"],
  ];
  const need = all.filter(([k]) => !cur.includes(k + "="));
  if (!need.length) return;
  const block = need.map(([k, v]) => `${k}=${v}`).join("\n") + "\n";
  fs.writeFileSync(fp, cur ? cur.trimEnd() + "\n" + block : block, "utf8");
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth / Payment env vars
// ─────────────────────────────────────────────────────────────────────────────

function authEnvVars(auth) {
  const map = {
    "clerk":         [["CLERK_SECRET_KEY", "sk_test_..."], ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "pk_test_..."]],
    "auth0":         [["AUTH0_DOMAIN", "your-domain.auth0.com"], ["AUTH0_CLIENT_ID", "..."], ["AUTH0_CLIENT_SECRET", "..."]],
    "better-auth":   [["BETTER_AUTH_SECRET", "change-me-at-least-32-chars"], ["BETTER_AUTH_URL", "http://localhost:3000"]],
    "supabase-auth": [["SUPABASE_URL", "https://xxx.supabase.co"], ["SUPABASE_ANON_KEY", "eyJ..."]],
    "next-auth":     [["NEXTAUTH_SECRET", "change-me-at-least-32-chars"], ["NEXTAUTH_URL", "http://localhost:3000"]],
    "lucia":         [["AUTH_SECRET", "change-me-at-least-32-chars"]],
  };
  return map[auth] || [];
}

function paymentEnvVars(pay) {
  const map = {
    "stripe":        [["STRIPE_SECRET_KEY", "sk_test_..."], ["STRIPE_WEBHOOK_SECRET", "whsec_..."]],
    "polar":         [["POLAR_ACCESS_TOKEN", "..."], ["POLAR_WEBHOOK_SECRET", "..."]],
    "paddle":        [["PADDLE_API_KEY", "..."], ["PADDLE_WEBHOOK_SECRET", "..."]],
    "lemon-squeezy": [["LEMONSQUEEZY_API_KEY", "..."], ["LEMONSQUEEZY_SIGNING_SECRET", "..."]],
  };
  return map[pay] || [];
}

// ─────────────────────────────────────────────────────────────────────────────
// DB connection string helpers
// ─────────────────────────────────────────────────────────────────────────────

function pyDbUrl(db, setup) {
  if (db === "sqlite") return "sqlite+aiosqlite:///./app.db";
  const prefix = { postgres: "postgresql+asyncpg", mysql: "mysql+aiomysql", mongodb: "mongodb" }[db] || "db";
  if (db === "postgres" && setup === "neon")           return `${prefix}://user:pass@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require`;
  if (db === "postgres" && setup === "supabase")       return `${prefix}://postgres:pass@db.xxx.supabase.co:5432/postgres`;
  if (db === "mysql"    && setup === "planetscale")    return `${prefix}://user:pass@aws.connect.psdb.cloud/dbname?ssl=true`;
  if (db === "mongodb"  && setup === "mongodb-atlas")  return `mongodb+srv://user:pass@cluster0.xxx.mongodb.net/mydb`;
  if (db === "postgres") return `${prefix}://postgres:password@localhost:5432/mydb`;
  if (db === "mysql")    return `${prefix}://root:password@localhost:3306/mydb`;
  if (db === "mongodb")  return `mongodb://localhost:27017/mydb`;
  return "";
}

function jsDbUrl(db, setup) {
  if (db === "sqlite") return "file:./dev.db";
  if (db === "postgres" && setup === "neon")           return `postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require`;
  if (db === "postgres" && setup === "supabase")       return `postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres`;
  if (db === "mysql"    && setup === "planetscale")    return `mysql://user:pass@aws.connect.psdb.cloud/dbname?ssl=true`;
  if (db === "mongodb"  && setup === "mongodb-atlas")  return `mongodb+srv://user:pass@cluster0.xxx.mongodb.net/mydb`;
  if (db === "postgres") return `postgresql://postgres:password@localhost:5432/mydb`;
  if (db === "mysql")    return `mysql://root:password@localhost:3306/mydb`;
  if (db === "mongodb")  return `mongodb://localhost:27017/mydb`;
  return "";
}

function goDbUrl(db, setup) {
  if (db === "sqlite")   return "app.db";
  if (db === "postgres" && setup === "neon") return "host=ep-xxx.us-east-1.aws.neon.tech user=user password=pass dbname=mydb sslmode=require";
  if (db === "postgres") return "host=localhost user=postgres password=password dbname=mydb port=5432 sslmode=disable";
  if (db === "mysql")    return "root:password@tcp(localhost:3306)/mydb?charset=utf8mb4&parseTime=True&loc=Local";
  return "";
}

// ─────────────────────────────────────────────────────────────────────────────
// Main entry
// ─────────────────────────────────────────────────────────────────────────────

export function generateExtras(target, opts) {
  switch (opts.lang) {
    case "python":     return genPython(target, opts);
    case "typescript":
    case "javascript": return genNode(target, opts);
    case "go":         return genGo(target, opts);
    default:           return writeEnvExample(target, [], opts);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Python
// ─────────────────────────────────────────────────────────────────────────────

function genPython(target, opts) {
  const { db, orm, dbSetup, name } = opts;
  const hasDb = db && db !== "none";
  if (!hasDb) return writeEnvExample(target, [], opts);

  const url = pyDbUrl(db, dbSetup);
  writeEnvExample(target, [["DATABASE_URL", url]], opts);

  const driverPkgs = {
    postgres: ["asyncpg>=0.29", "psycopg2-binary>=2.9"],
    mysql:    ["aiomysql>=0.2"],
    sqlite:   ["aiosqlite>=0.19"],
    mongodb:  ["motor>=3.3"],
  }[db] || [];

  if (orm === "sqlalchemy") {
    appendReqs(target, [
      "sqlalchemy[asyncio]>=2.0",
      "alembic>=1.13",
      "pydantic-settings>=2.3",
      ...driverPkgs,
    ]);
    genFastapiSqlalchemy(target, name, db, url);
  } else {
    appendReqs(target, ["pydantic-settings>=2.3", ...driverPkgs]);
    // Minimal config only
    write(target, "app/core/__init__.py", "");
    write(target, "app/core/config.py",
`from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = "${url}"
    DEBUG: bool = False


settings = Settings()
`);
  }
}

function genFastapiSqlalchemy(target, name, db, url) {
  // ── app/core/ ──────────────────────────────────────────────────────────────
  write(target, "app/core/__init__.py", "");

  write(target, "app/core/config.py",
`from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = "${url}"
    DEBUG: bool = False


settings = Settings()
`);

  write(target, "app/core/database.py",
`from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=settings.DEBUG)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
`);

  // ── app/models/ ────────────────────────────────────────────────────────────
  write(target, "app/models/__init__.py", "");

  write(target, "app/models/base.py",
`from sqlalchemy import DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class TimestampMixin:
    created_at: Mapped[DateTime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )
`);

  // ── app/api/ ───────────────────────────────────────────────────────────────
  write(target, "app/api/__init__.py", "");
  write(target, "app/api/routes/__init__.py", "");

  write(target, "app/api/routes/health.py",
`from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
async def health_check(db: AsyncSession = Depends(get_db)):
    try:
        await db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db_status = "unavailable"
    return {"status": "ok", "database": db_status}
`);

  // ── app/main.py (replace minimal stub) ────────────────────────────────────
  write(target, "app/main.py",
`from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.routes import health
from app.core.database import engine
from app.models.base import Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create tables on startup.
    # For production use: run \`alembic upgrade head\` instead.
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(title="${name}", lifespan=lifespan)

app.include_router(health.router)


@app.get("/")
async def root():
    return {
        "app": "${name}",
        "framework": "fastapi",
        "db": "${db}",
        "docs": "/docs",
    }
`);

  // ── alembic/ ───────────────────────────────────────────────────────────────
  write(target, "alembic.ini",
`[alembic]
script_location = alembic
prepend_sys_path = .
sqlalchemy.url = driver://user:pass@localhost/dbname

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console
qualname =

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
`);

  write(target, "alembic/env.py",
`import asyncio
import os
from logging.config import fileConfig

from alembic import context
from sqlalchemy.ext.asyncio import create_async_engine

from app.models.base import Base

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def get_url() -> str:
    return os.getenv("DATABASE_URL", config.get_main_option("sqlalchemy.url", ""))


def run_migrations_offline() -> None:
    context.configure(
        url=get_url(),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    engine = create_async_engine(get_url())
    async with engine.connect() as connection:
        await connection.run_sync(
            lambda conn: context.configure(connection=conn, target_metadata=target_metadata)
        )
        async with connection.begin():
            await connection.run_sync(lambda _: context.run_migrations())
    await engine.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
`);

  write(target, "alembic/versions/.gitkeep", "");
}

// ─────────────────────────────────────────────────────────────────────────────
// Node.js (TypeScript / JavaScript)
// ─────────────────────────────────────────────────────────────────────────────

function genNode(target, opts) {
  const { db, orm, dbSetup } = opts;
  const hasDb = db && db !== "none";
  if (!hasDb) return writeEnvExample(target, [], opts);

  const url = jsDbUrl(db, dbSetup);
  writeEnvExample(target, [["DATABASE_URL", url]], opts);

  const ext = opts.lang === "typescript" ? "ts" : "js";
  const isMongo = db === "mongodb";

  if (orm === "drizzle" && !isMongo) return genDrizzle(target, opts, url, ext);
  if (orm === "prisma")               return genPrisma(target, opts, url);
  if (orm === "typeorm" && !isMongo)  return genTypeOrm(target, opts, url, ext);
  return genNodeRaw(target, opts, url, ext);
}

// ── Drizzle ──────────────────────────────────────────────────────────────────

const DRIZZLE_CONF = {
  postgres: {
    deps:    { "drizzle-orm": "^0.30.0", pg: "^8.12.0" },
    dev:     { "drizzle-kit": "^0.22.0", "@types/pg": "^8.11.0" },
    dialect: "postgresql",
    tableFunc:    "pgTable",
    colImport:    "pgTable, serial, text, timestamp",
    colModule:    "drizzle-orm/pg-core",
    colDefs:      `  id:        serial("id").primaryKey(),\n  title:     text("title").notNull(),\n  content:   text("content"),\n  createdAt: timestamp("created_at").defaultNow().notNull(),`,
    clientImport: `import { drizzle } from "drizzle-orm/node-postgres";\nimport { Pool } from "pg";`,
    clientInit:   `const pool = new Pool({ connectionString: process.env.DATABASE_URL });\nexport const db = drizzle(pool, { schema });`,
  },
  mysql: {
    deps:    { "drizzle-orm": "^0.30.0", mysql2: "^3.9.0" },
    dev:     { "drizzle-kit": "^0.22.0" },
    dialect: "mysql",
    tableFunc:    "mysqlTable",
    colImport:    "mysqlTable, serial, varchar, datetime",
    colModule:    "drizzle-orm/mysql-core",
    colDefs:      `  id:    serial("id").primaryKey(),\n  title: varchar("title", { length: 255 }).notNull(),\n  content: varchar("content", { length: 1000 }),`,
    clientImport: `import { drizzle } from "drizzle-orm/mysql2";\nimport mysql from "mysql2/promise";`,
    clientInit:   `const connection = await mysql.createConnection(process.env.DATABASE_URL!);\nexport const db = drizzle(connection, { schema });`,
  },
  sqlite: {
    deps:    { "drizzle-orm": "^0.30.0", "better-sqlite3": "^9.4.0" },
    dev:     { "drizzle-kit": "^0.22.0", "@types/better-sqlite3": "^7.6.0" },
    dialect: "sqlite",
    tableFunc:    "sqliteTable",
    colImport:    "sqliteTable, integer, text",
    colModule:    "drizzle-orm/sqlite-core",
    colDefs:      `  id:      integer("id").primaryKey({ autoIncrement: true }),\n  title:   text("title").notNull(),\n  content: text("content"),`,
    clientImport: `import { drizzle } from "drizzle-orm/better-sqlite3";\nimport Database from "better-sqlite3";`,
    clientInit:   `const sqlite = new Database(process.env.DATABASE_URL?.replace("file:", "") ?? "dev.db");\nexport const db = drizzle(sqlite, { schema });`,
  },
};

function genDrizzle(target, opts, url, ext) {
  const d = DRIZZLE_CONF[opts.db];
  if (!d) return;

  patchPkg(target, {
    deps: d.deps,
    dev:  d.dev,
    scripts: {
      "db:generate": "drizzle-kit generate",
      "db:migrate":  "drizzle-kit migrate",
      "db:push":     "drizzle-kit push",
      "db:studio":   "drizzle-kit studio",
    },
  });

  write(target, `src/db/schema.${ext}`,
`import { ${d.colImport} } from "${d.colModule}";

export const posts = ${d.tableFunc}("posts", {
${d.colDefs}
});
`);

  write(target, `src/db/index.${ext}`,
`${d.clientImport}
import * as schema from "./schema";

${d.clientInit}
`);

  write(target, `drizzle.config.${ext}`,
`import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema:  "./src/db/schema.${ext}",
  out:     "./drizzle",
  dialect: "${d.dialect}",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
`);

  write(target, "drizzle/.gitkeep", "");
}

// ── Prisma ────────────────────────────────────────────────────────────────────

const PRISMA_PROVIDER = { postgres: "postgresql", mysql: "mysql", sqlite: "sqlite", mongodb: "mongodb" };

function genPrisma(target, opts, url) {
  const provider = PRISMA_PROVIDER[opts.db] || "postgresql";

  patchPkg(target, {
    deps:    { "@prisma/client": "^5.14.0" },
    dev:     { prisma: "^5.14.0" },
    scripts: {
      "db:generate": "prisma generate",
      "db:push":     "prisma db push",
      "db:migrate":  "prisma migrate dev",
      "db:studio":   "prisma studio",
    },
  });

  write(target, "prisma/schema.prisma",
`// Prisma Schema — https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${provider}"
  url      = env("DATABASE_URL")
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`);

  write(target, "src/db/index.ts",
`import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
`);
}

// ── TypeORM ───────────────────────────────────────────────────────────────────

const TYPEORM_DRIVER = {
  postgres: { type: "postgres",  pkg: "pg",     types: "@types/pg" },
  mysql:    { type: "mysql",     pkg: "mysql2",  types: null },
  sqlite:   { type: "sqlite",    pkg: "better-sqlite3", types: "@types/better-sqlite3" },
};

function genTypeOrm(target, opts, url, ext) {
  const dr = TYPEORM_DRIVER[opts.db] || TYPEORM_DRIVER.postgres;
  const dev = dr.types ? { [dr.types]: "^8.11.0" } : {};

  patchPkg(target, {
    deps: { typeorm: "^0.3.20", "reflect-metadata": "^0.2.2", [dr.pkg]: "^8.11.0" },
    dev,
  });

  write(target, `src/data-source.${ext}`,
`import "reflect-metadata";
import { DataSource } from "typeorm";
import { Post } from "./entities/Post";

export const AppDataSource = new DataSource({
  type: "${dr.type}",
  url: process.env.DATABASE_URL,
  synchronize: process.env.NODE_ENV !== "production", // disable in production
  logging: process.env.NODE_ENV === "development",
  entities: [Post],
  migrations: ["src/migrations/*.${ext}"],
  subscribers: [],
});
`);

  write(target, `src/entities/Post.${ext}`,
`import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("posts")
export class Post {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ nullable: true })
  content?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
`);

  write(target, "src/migrations/.gitkeep", "");
}

// ── Raw connection (no ORM) ───────────────────────────────────────────────────

function genNodeRaw(target, opts, url, ext) {
  const { db } = opts;

  if (db === "mongodb") {
    patchPkg(target, { deps: { mongoose: "^8.3.0" } });
    write(target, `src/db/index.${ext}`,
`import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(process.env.DATABASE_URL!);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

// Example schema
const postSchema = new mongoose.Schema(
  {
    title:   { type: String, required: true },
    content: { type: String },
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post", postSchema);
`);
    return;
  }

  const rawConf = {
    postgres: {
      deps: { pg: "^8.12.0" },
      dev:  { "@types/pg": "^8.11.0" },
      code: `import { Pool } from "pg";\n\nconst pool = new Pool({ connectionString: process.env.DATABASE_URL });\n\nexport { pool };\n`,
    },
    mysql: {
      deps: { mysql2: "^3.9.0" },
      dev:  {},
      code: `import mysql from "mysql2/promise";\n\nconst pool = mysql.createPool(process.env.DATABASE_URL!);\n\nexport { pool };\n`,
    },
    sqlite: {
      deps: { "better-sqlite3": "^9.4.0" },
      dev:  { "@types/better-sqlite3": "^7.6.0" },
      code: `import Database from "better-sqlite3";\n\nconst db = new Database(\n  process.env.DATABASE_URL?.replace("file:", "") ?? "dev.db"\n);\n\nexport { db };\n`,
    },
  }[db];

  if (!rawConf) return;
  patchPkg(target, { deps: rawConf.deps, dev: rawConf.dev });
  write(target, `src/db/index.${ext}`, rawConf.code);
}

// ─────────────────────────────────────────────────────────────────────────────
// Go
// ─────────────────────────────────────────────────────────────────────────────

function genGo(target, opts) {
  const { db, orm, dbSetup, name } = opts;
  if (!db || db === "none") return writeEnvExample(target, [], opts);

  const url = goDbUrl(db, dbSetup);
  writeEnvExample(target, [["DATABASE_URL", url]], opts);

  if (orm === "gorm") genGoGorm(target, name, db);
}

const GORM_DRIVER = {
  postgres: { pkg: "gorm.io/driver/postgres", open: `postgres.Open(os.Getenv("DATABASE_URL"))`, alias: "postgres" },
  mysql:    { pkg: "gorm.io/driver/mysql",    open: `mysql.Open(os.Getenv("DATABASE_URL"))`,    alias: "mysql"    },
  sqlite:   { pkg: "gorm.io/driver/sqlite",   open: `sqlite.Open(os.Getenv("DATABASE_URL"))`,   alias: "sqlite"   },
};

function genGoGorm(target, name, db) {
  const dr = GORM_DRIVER[db] || GORM_DRIVER.postgres;

  // Patch go.mod (best-effort)
  const goModPath = path.join(target, "go.mod");
  if (fs.existsSync(goModPath)) {
    let mod = fs.readFileSync(goModPath, "utf8");
    const toAdd = [
      "\tgorm.io/gorm v1.25.10",
      `\t${dr.pkg} v1.25.10`,
    ].filter(d => !mod.includes(d.trim().split(" ")[0]));
    if (toAdd.length) {
      mod = mod.replace("require (", `require (\n${toAdd.join("\n")}`);
      fs.writeFileSync(goModPath, mod, "utf8");
    }
  }

  write(target, "internal/database/database.go",
`package database

import (
\t"log"
\t"os"

\t"gorm.io/gorm"
\t"${dr.pkg}"
)

var DB *gorm.DB

func Connect() {
\tdsn := os.Getenv("DATABASE_URL")
\tdb, err := gorm.Open(${dr.open}, &gorm.Config{})
\tif err != nil {
\t\tlog.Fatalf("failed to connect database: %v", err)
\t}
\tDB = db
\tlog.Println("Database connected")
}
`);

  write(target, "internal/models/post.go",
`package models

import "gorm.io/gorm"

type Post struct {
\tgorm.Model
\tTitle   string \`gorm:"not null" json:"title"\`
\tContent string \`json:"content"\`
}
`);

  // Update main.go to wire database (best-effort: prepend init call)
  const mainGoPath = path.join(target, "main.go");
  if (fs.existsSync(mainGoPath)) {
    let src = fs.readFileSync(mainGoPath, "utf8");
    if (!src.includes("database.Connect")) {
      const moduleName = name || "app";
      src = src.replace(
        /func main\(\) \{/,
        `func main() {\n\tdatabase.Connect()\n`
      );
      src = `import "${moduleName}/internal/database"\n` + src;
      fs.writeFileSync(mainGoPath, src, "utf8");
    }
  }
}
