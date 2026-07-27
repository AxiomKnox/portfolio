import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { STATUS_ORDER, type Status } from "@/content/types";
import { statusDisplayEntries, statusLabel, statusSearchText } from "@/lib/status-display";

describe("statusLabel", () => {
  test("compact labels match dense UI copy", () => {
    expect(statusLabel("prod", "compact")).toBe("Prod");
    expect(statusLabel("dev", "compact")).toBe("Dev");
    expect(statusLabel("alpha")).toBe("Alpha");
  });

  test("prose labels keep detail-page fork", () => {
    expect(statusLabel("prod", "prose")).toBe("Production");
    expect(statusLabel("dev", "prose")).toBe("In development");
    expect(statusLabel("beta", "prose")).toBe("Beta");
  });

  test("covers every STATUS_ORDER value", () => {
    for (const status of STATUS_ORDER) {
      expect(statusLabel(status, "compact").length).toBeGreaterThan(0);
      expect(statusLabel(status, "prose").length).toBeGreaterThan(0);
    }
  });
});

describe("statusSearchText", () => {
  test("includes id and compact label for fuzzy match", () => {
    expect(statusSearchText("prod")).toBe("prod Prod");
    expect(statusSearchText("dev")).toBe("dev Dev");
  });
});

describe("statusDisplayEntries", () => {
  test("follows STATUS_ORDER", () => {
    expect(statusDisplayEntries("compact").map((e) => e.status)).toEqual([...STATUS_ORDER]);
  });
});

describe("status paint source", () => {
  const styles = readFileSync(join(process.cwd(), "src/styles.css"), "utf8");

  test("defines --status-* tokens and .status-dot data-status map", () => {
    for (const status of STATUS_ORDER) {
      expect(styles).toContain(`--status-${status}`);
      expect(styles).toContain(`.status-dot[data-status="${status}"]`);
    }
  });

  test("consumers no longer keep local STATUS_DOT / STATUS_META color tables", () => {
    const files = [
      "src/components/ProjectCard.tsx",
      "src/components/ProjectsToolbar.tsx",
      "src/pages/projects/[id].astro",
    ];
    for (const file of files) {
      const src = readFileSync(join(process.cwd(), file), "utf8");
      expect(src).not.toContain("STATUS_DOT");
      expect(src).not.toContain("STATUS_META");
      expect(src).not.toContain("bg-emerald-500");
      expect(src).toContain("status-dot");
      expect(src).toContain("data-status");
    }
  });

  test("label module stays presentation-only (not content data)", () => {
    const projectTypes = readFileSync(join(process.cwd(), "src/content/types/project.ts"), "utf8");
    expect(projectTypes).not.toContain("statusLabel");
    expect(projectTypes).not.toContain("bg-emerald");
    // Exhaustiveness: Status union still drives both order and display
    const statuses: Status[] = ["dev", "alpha", "beta", "prod", "archived"];
    expect([...STATUS_ORDER]).toEqual(statuses);
  });
});
