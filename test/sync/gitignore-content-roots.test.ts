import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const gitignorePath = resolve(import.meta.dir, "../../.gitignore");

describe(".gitignore live content roots", () => {
  test("ignores generated projects/ and profile/; keeps placeholder tracked", async () => {
    const text = await readFile(gitignorePath, "utf8");
    expect(text).toMatch(/^src\/content\/projects\/\s*$/m);
    expect(text).toMatch(/^src\/content\/profile\/\s*$/m);
    expect(text).not.toMatch(/^src\/content\/placeholder\/\s*$/m);
  });
});
