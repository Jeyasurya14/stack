import { describe, it, expect } from "vitest";
import {
  LANGUAGES,
  DATABASES,
  FEATURES,
  findTemplate,
  buildCommand,
} from "../src/stacks.js";

describe("stacks registry", () => {
  it("has at least one framework per language", () => {
    for (const l of LANGUAGES) {
      expect(l.frameworks.length).toBeGreaterThan(0);
      for (const f of l.frameworks) {
        expect(f.template).toMatch(/^[a-z0-9-]+$/);
      }
    }
  });

  it("every framework.template is unique", () => {
    const all = LANGUAGES.flatMap((l) => l.frameworks.map((f) => f.template));
    expect(new Set(all).size).toBe(all.length);
  });

  it("findTemplate returns the right id", () => {
    expect(findTemplate("python", "fastapi")).toBe("python-fastapi");
    expect(findTemplate("typescript", "nextjs")).toBe("ts-nextjs");
    expect(findTemplate("nope", "x")).toBeNull();
  });

  it("databases include none + at least 4 engines", () => {
    expect(DATABASES.find((d) => d.id === "none")).toBeTruthy();
    expect(DATABASES.length).toBeGreaterThanOrEqual(5);
  });

  it("features include docker/git/readme", () => {
    const ids = FEATURES.map((f) => f.id);
    for (const f of ["docker", "git", "readme"]) expect(ids).toContain(f);
  });
});

describe("buildCommand", () => {
  it("emits a clean npx command", () => {
    expect(
      buildCommand({
        name: "my-app",
        lang: "python",
        framework: "fastapi",
        db: "postgres",
        features: ["docker", "git"],
      })
    ).toBe(
      "npx create-polystack@latest my-app --lang python --framework fastapi --db postgres --features docker,git"
    );
  });

  it("omits db when none", () => {
    const cmd = buildCommand({
      name: "x",
      lang: "java",
      framework: "spring-boot",
      db: "none",
    });
    expect(cmd).not.toContain("--db");
  });
});
