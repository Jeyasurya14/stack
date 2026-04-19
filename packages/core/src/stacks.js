// Central registry of supported languages, frameworks, databases, and features.
// Both the web UI and the CLI import from here so they stay in sync.

export const LANGUAGES = [
  {
    id: "java",
    name: "Java",
    color: "#f89820",
    frameworks: [
      { id: "spring-boot", name: "Spring Boot", template: "java-spring-boot" },
    ],
  },
  {
    id: "python",
    name: "Python",
    color: "#3776ab",
    frameworks: [
      { id: "fastapi", name: "FastAPI", template: "python-fastapi" },
      { id: "django", name: "Django", template: "python-django" },
    ],
  },
  {
    id: "javascript",
    name: "JavaScript",
    color: "#f7df1e",
    frameworks: [
      { id: "express", name: "Express", template: "js-express" },
    ],
  },
  {
    id: "typescript",
    name: "TypeScript",
    color: "#3178c6",
    frameworks: [
      { id: "hono", name: "Hono", template: "ts-hono" },
      { id: "nextjs", name: "Next.js", template: "ts-nextjs" },
    ],
  },
  {
    id: "php",
    name: "PHP",
    color: "#777bb4",
    frameworks: [
      { id: "slim", name: "Slim", template: "php-slim" },
    ],
  },
];

export const DATABASES = [
  { id: "none", name: "None" },
  { id: "postgres", name: "PostgreSQL" },
  { id: "mysql", name: "MySQL" },
  { id: "sqlite", name: "SQLite" },
  { id: "mongodb", name: "MongoDB" },
];

export const FEATURES = [
  { id: "docker", name: "Docker" },
  { id: "git", name: "Git init" },
  { id: "readme", name: "README" },
];

export function findTemplate(langId, frameworkId) {
  const lang = LANGUAGES.find((l) => l.id === langId);
  if (!lang) return null;
  const fw = lang.frameworks.find((f) => f.id === frameworkId);
  return fw ? fw.template : null;
}

export function buildCommand({ name, lang, framework, db, features }) {
  const parts = [`npx create-polystack@latest`, name || "my-app"];
  if (lang) parts.push(`--lang ${lang}`);
  if (framework) parts.push(`--framework ${framework}`);
  if (db && db !== "none") parts.push(`--db ${db}`);
  if (features && features.length) parts.push(`--features ${features.join(",")}`);
  return parts.join(" ");
}
