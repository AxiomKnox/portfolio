import { describe, expect, test } from "bun:test";
import {
  experienceHeadline,
  experienceTimelineEntries,
  parseLearningSignalsEnabled,
  shouldShowCertifications,
  shouldShowResume,
  showLearningSignal,
} from "@/content/profile-display";

describe("parseLearningSignalsEnabled", () => {
  test("defaults off when unset or non-truthy", () => {
    expect(parseLearningSignalsEnabled(undefined)).toBe(false);
    expect(parseLearningSignalsEnabled("")).toBe(false);
    expect(parseLearningSignalsEnabled("false")).toBe(false);
    expect(parseLearningSignalsEnabled("0")).toBe(false);
    expect(parseLearningSignalsEnabled("yes")).toBe(false);
  });

  test("accepts explicit truthy env values", () => {
    expect(parseLearningSignalsEnabled("true")).toBe(true);
    expect(parseLearningSignalsEnabled("TRUE")).toBe(true);
    expect(parseLearningSignalsEnabled("1")).toBe(true);
    expect(parseLearningSignalsEnabled(true)).toBe(true);
    expect(parseLearningSignalsEnabled(1)).toBe(true);
  });
});

describe("showLearningSignal", () => {
  test("requires learning marker and respects enabled flag", () => {
    expect(showLearningSignal({}, false)).toBe(false);
    expect(showLearningSignal({ learning: false }, false)).toBe(false);
    expect(showLearningSignal({ learning: true }, false)).toBe(false);
    expect(showLearningSignal({ learning: true }, true)).toBe(true);
    expect(showLearningSignal({ learning: false }, true)).toBe(false);
    expect(showLearningSignal({}, true)).toBe(false);
  });
});

describe("shouldShowCertifications", () => {
  test("shows populated lists by default", () => {
    expect(shouldShowCertifications([{ name: "CKA" }])).toBe(true);
  });

  test("hides empty lists", () => {
    expect(shouldShowCertifications([])).toBe(false);
  });
});

describe("shouldShowResume", () => {
  test("shows only when assemble recorded resume.pdf", () => {
    expect(shouldShowResume({ resume: "resume.pdf" })).toBe(true);
    expect(shouldShowResume({})).toBe(false);
    expect(shouldShowResume({ resume: "cv.pdf" })).toBe(false);
  });
});

describe("experienceHeadline / experienceTimelineEntries", () => {
  const jobs = [
    {
      role: "Staff MLOps Engineer",
      company: "Beacon Labs",
      location: "Remote",
      start: "2024-03",
      end: "Present",
      summary: "Harness work.",
    },
  ];

  test("uses the first job and is null-safe when empty", () => {
    expect(experienceHeadline(jobs)).toBe("Staff MLOps Engineer · Beacon Labs");
    expect(experienceHeadline([])).toBeNull();
    expect(experienceTimelineEntries(jobs)).toEqual(jobs);
  });

  test("timeline entries returns a shallow copy", () => {
    const entries = experienceTimelineEntries(jobs);
    expect(entries).toEqual(jobs);
    expect(entries).not.toBe(jobs);
  });
});
