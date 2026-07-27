import { describe, expect, test } from "bun:test";
import { joinRemotePath, normalizeRemotePath, parseSyncConfig } from "@/sync/config";

const valid = {
  profile: { owner: "acme", repo: "personal", path: "/profile/" },
  projects: [
    { id: "atlas-deploy", owner: "acme", repo: "atlas", path: "content" },
    { id: "tessera", owner: "acme", repo: "tessera", path: "", ref: "main" },
  ],
};

describe("parseSyncConfig", () => {
  test("normalizes paths and accepts valid config", () => {
    const cfg = parseSyncConfig(valid);
    expect(cfg.profile?.path).toBe("profile");
    expect(cfg.projects[0]?.path).toBe("content");
    expect(cfg.projects[1]?.path).toBe("");
    expect(cfg.projects[1]?.ref).toBe("main");
  });

  test("accepts omitted profile (skip profile sync)", () => {
    const cfg = parseSyncConfig({
      projects: [{ id: "atlas-deploy", owner: "acme", repo: "atlas", path: "" }],
    });
    expect(cfg.profile).toBeUndefined();
    expect(cfg.projects).toHaveLength(1);
  });

  test("skips TODO profile placeholders (no profile remote)", () => {
    const cfg = parseSyncConfig({
      profile: { owner: "TODO", repo: "TODO", path: "profile" },
      projects: [{ id: "atlas-deploy", owner: "acme", repo: "atlas", path: "" }],
    });
    expect(cfg.profile).toBeUndefined();
    expect(cfg.projects[0]?.id).toBe("atlas-deploy");
  });

  test("fails closed on duplicate project ids", () => {
    expect(() =>
      parseSyncConfig({
        ...valid,
        projects: [
          { id: "atlas-deploy", owner: "acme", repo: "a", path: "" },
          { id: "atlas-deploy", owner: "acme", repo: "b", path: "" },
        ],
      }),
    ).toThrow(/duplicate project id/);
  });

  test("fails closed on TODO project owner/repo placeholders", () => {
    expect(() =>
      parseSyncConfig({
        projects: [{ id: "atlas-deploy", owner: "TODO", repo: "TODO", path: "" }],
      }),
    ).toThrow(/TODO owner\/repo/);
  });

  test("fails closed on extra keys", () => {
    expect(() => parseSyncConfig({ ...valid, token: "secret" })).toThrow();
  });
});

describe("path helpers", () => {
  test("normalize and join remote paths", () => {
    expect(normalizeRemotePath("/a/b/")).toBe("a/b");
    expect(joinRemotePath("content", "project.md")).toBe("content/project.md");
    expect(joinRemotePath("", "project.md")).toBe("project.md");
  });
});
