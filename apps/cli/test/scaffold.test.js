import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { scaffold } from "../src/scaffold.js";

describe("scaffold", () => {
  let tmp;
  let templateDir;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "polystack-test-"));
    templateDir = path.join(tmp, "template");
    fs.mkdirSync(templateDir, { recursive: true });
    fs.writeFileSync(
      path.join(templateDir, "README.md"),
      "# {{PROJECT_NAME}}\n db={{DB}}"
    );
    fs.writeFileSync(path.join(templateDir, "_gitignore"), "node_modules\n");
    fs.mkdirSync(path.join(templateDir, "src"));
    fs.writeFileSync(
      path.join(templateDir, "src", "index.js"),
      'console.log("{{PROJECT_NAME}}");'
    );
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("copies files, renames _gitignore, and substitutes vars", async () => {
    const target = path.join(tmp, "out");
    await scaffold({
      templateDir,
      target,
      vars: { PROJECT_NAME: "demo", DB: "postgres" },
    });

    expect(fs.existsSync(path.join(target, ".gitignore"))).toBe(true);
    expect(fs.existsSync(path.join(target, "_gitignore"))).toBe(false);

    const readme = fs.readFileSync(path.join(target, "README.md"), "utf8");
    expect(readme).toBe("# demo\n db=postgres");

    const js = fs.readFileSync(path.join(target, "src", "index.js"), "utf8");
    expect(js).toBe('console.log("demo");');
  });

  it("leaves unknown placeholders intact", async () => {
    const target = path.join(tmp, "out2");
    fs.writeFileSync(path.join(templateDir, "weird.txt"), "{{UNKNOWN}}");
    await scaffold({
      templateDir,
      target,
      vars: { PROJECT_NAME: "x", DB: "none" },
    });
    const weird = fs.readFileSync(path.join(target, "weird.txt"), "utf8");
    expect(weird).toBe("{{UNKNOWN}}");
  });
});
