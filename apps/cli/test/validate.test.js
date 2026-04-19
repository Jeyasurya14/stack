import { describe, it, expect } from "vitest";
import { validateProjectName, safeTargetPath } from "../src/validate.js";

describe("validateProjectName", () => {
  it("accepts simple kebab-case", () => {
    expect(validateProjectName("my-app").ok).toBe(true);
  });
  it("rejects empty", () => {
    expect(validateProjectName("").ok).toBe(false);
  });
  it("rejects path separators", () => {
    expect(validateProjectName("a/b").ok).toBe(false);
    expect(validateProjectName("a\\b").ok).toBe(false);
  });
  it("rejects reserved names", () => {
    expect(validateProjectName("node_modules").ok).toBe(false);
    expect(validateProjectName("CON").ok).toBe(false);
  });
  it("rejects leading dot/underscore", () => {
    expect(validateProjectName(".hidden").ok).toBe(false);
    expect(validateProjectName("_thing").ok).toBe(false);
  });
  it("rejects uppercase", () => {
    expect(validateProjectName("MyApp").ok).toBe(false);
  });
});

describe("safeTargetPath", () => {
  it("resolves simple name under cwd", () => {
    const p = safeTargetPath("/tmp/work", "foo");
    expect(p.endsWith("foo")).toBe(true);
  });
  it("blocks escape via ..", () => {
    expect(() => safeTargetPath("/tmp/work", "../evil")).toThrow();
  });
});
