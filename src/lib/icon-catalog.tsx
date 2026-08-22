/**
 * Icon catalogs only (no renderers).
 * UI = curated Lucide chrome; Brand = tech/social glyphs + coverage helpers.
 * Colors are manual overrides only — never read hex metadata from packages.
 */
// --- Devicon icons ---
import type { ComponentType, SVGProps } from "react";
import IconAstro from "~icons/devicon/astro";
import IconAws from "~icons/logos/aws";
import IconBun from "~icons/devicon/bun";
import IconCloudflare from "~icons/devicon/cloudflare";
import IconDocker from "~icons/simple-icons/docker";
import IconDuckdb from "~icons/devicon/duckdb";
import IconFastapi from "~icons/devicon/fastapi";
import IconFlask from "~icons/devicon/flask";
import IconGithub from "~icons/logos/github-icon";
import IconGithubActions from "~icons/devicon/githubactions";
import IconGo from "~icons/devicon/go";
import IconGrafana from "~icons/devicon/grafana";
import IconHelm from "~icons/devicon/helm";
import IconHuggingFace from "~icons/devicon/huggingface";
import IconJavascript from "~icons/devicon/javascript";
import IconJupyter from "~icons/devicon/jupyter";
import IconKubernetes from "~icons/devicon/kubernetes";
import IconLinux from "~icons/devicon/linux";
import IconLinkedin from "~icons/logos/linkedin-icon";
import IconLoki from "~icons/selfhst/loki";
import IconMatplotlib from "~icons/devicon/matplotlib";
import IconMlflow from "~icons/simple-icons/mlflow";
import IconMongodb from "~icons/devicon/mongodb";
import IconNextjs from "~icons/devicon/nextjs";
import IconNginx from "~icons/simple-icons/nginx";
import IconNodejs from "~icons/devicon/nodejs";
import IconNumpy from "~icons/devicon/numpy";
import IconOllama from "~icons/devicon/ollama";
import IconOpenlayers from "~icons/simple-icons/openlayers";
import IconPandas from "~icons/devicon/pandas";
import IconPostgresql from "~icons/devicon/postgresql";
import IconPrometheus from "~icons/devicon/prometheus";
import IconPyQt5 from "~icons/devicon/qt";
import IconPython from "~icons/devicon/python";
import IconPytorch from "~icons/devicon/pytorch";
import IconReact from "~icons/devicon/react";
import IconRedis from "~icons/simple-icons/redis";
import IconRust from "~icons/devicon/rust";
import IconScikitLearn from "~icons/devicon/scikitlearn";
import IconSeaborn from "~icons/devicon/seaborn";
import IconSQLite from "~icons/devicon/sqlite";
import IconTailwind from "~icons/devicon/tailwindcss";
import IconTailscale from "~icons/simple-icons/tailscale";
import IconTensorflow from "~icons/devicon/tensorflow";
import IconTerraform from "~icons/devicon/terraform";
import IconTypescript from "~icons/devicon/typescript";
import IconVercel from "~icons/devicon/vercel";
import IconVite from "~icons/simple-icons/vite";
import IconGmail from "~icons/logos/google-gmail";
import IconGoogleCloud from "~icons/logos/google-cloud";
import IconX from "~icons/logos/x";
// --- Lucide icons ---
import IconActivity from "~icons/lucide/activity";
import IconArrowDownUp from "~icons/lucide/arrow-down-up";
import IconArrowRight from "~icons/lucide/arrow-right";
import IconArrowUpRight from "~icons/lucide/arrow-up-right";
import IconBox from "~icons/lucide/box";
import IconCalendar from "~icons/lucide/calendar";
import IconCircleDashed from "~icons/lucide/circle-dashed";
import IconClock from "~icons/lucide/clock";
import IconCloud from "~icons/lucide/cloud";
import IconDownload from "~icons/lucide/download";
import IconExternalLink from "~icons/lucide/external-link";
import IconFileText from "~icons/lucide/file-text";
import IconFilter from "~icons/lucide/filter";
import IconGithubLucide from "~icons/lucide/github";
import IconGlobe from "~icons/lucide/globe";
import IconGraduationCap from "~icons/lucide/graduation-cap";
import IconLayoutGrid from "~icons/lucide/layout-grid";
import IconList from "~icons/lucide/list";
import IconMail from "~icons/lucide/mail";
import IconMapPin from "~icons/lucide/map-pin";
import IconMoreHorizontal from "~icons/lucide/more-horizontal";
import IconSearch from "~icons/lucide/search";
import IconServer from "~icons/lucide/server";
import IconSparkles from "~icons/lucide/sparkles";
import IconTag from "~icons/lucide/tag";
import IconWaves from "~icons/lucide/waves";
import IconXLucide from "~icons/lucide/x";

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

// --- UI (Lucide chrome) ---
/** Lucide icon names used by static Astro pages / shell chrome. */
export const UI_ICONS = {
  activity: IconActivity,
  "arrow-down-up": IconArrowDownUp,
  "arrow-right": IconArrowRight,
  "arrow-up-right": IconArrowUpRight,
  box: IconBox,
  calendar: IconCalendar,
  "circle-dashed": IconCircleDashed,
  clock: IconClock,
  cloud: IconCloud,
  download: IconDownload,
  "external-link": IconExternalLink,
  "file-text": IconFileText,
  filter: IconFilter,
  github: IconGithubLucide,
  globe: IconGlobe,
  "graduation-cap": IconGraduationCap,
  "layout-grid": IconLayoutGrid,
  list: IconList,
  mail: IconMail,
  "map-pin": IconMapPin,
  "more-horizontal": IconMoreHorizontal,
  search: IconSearch,
  server: IconServer,
  sparkles: IconSparkles,
  tag: IconTag,
  waves: IconWaves,
  x: IconXLucide,
} as const satisfies Record<string, IconComponent>;

export type UiIconName = keyof typeof UI_ICONS;

// --- Brand / tech / social ---
export type BrandIconEntry = {
  icon: IconComponent;
  /** Light-mode fill/stroke when the native SVG color needs a manual override. */
  lightModeOverrideColor?: string;
  /**
   * Dark mode: skip global muted fill; keep native SVG paints and apply grayscale.
   * Omit (default) = filled with `--muted-foreground`.
   */
  darkModeGrayscale?: true;
};

/** Canonical brand → compiled Iconify component (devicon / logos / simple-icons). */
export const BRAND_ICONS = {
  // Languages & runtimes
  typescript: { icon: IconTypescript, darkModeGrayscale: true },
  javascript: { icon: IconJavascript },
  python: { icon: IconPython },
  go: { icon: IconGo, darkModeGrayscale: true },
  rust: { icon: IconRust },
  bun: { icon: IconBun, darkModeGrayscale: true },
  node: { icon: IconNodejs, darkModeGrayscale: true },
  "node.js": { icon: IconNodejs, darkModeGrayscale: true },
  nodejs: { icon: IconNodejs, darkModeGrayscale: true },

  // Frontend / frameworks
  react: { icon: IconReact },
  "next.js": { icon: IconNextjs, darkModeGrayscale: true },
  nextjs: { icon: IconNextjs, darkModeGrayscale: true },
  fastapi: { icon: IconFastapi },
  vite: { icon: IconVite, lightModeOverrideColor: "#9135FF" },
  tailwind: { icon: IconTailwind },
  tailwindcss: { icon: IconTailwind },
  astro: { icon: IconAstro },
  pyqt5: { icon: IconPyQt5 },
  mongodb: { icon: IconMongodb },
  flask: { icon: IconFlask },
  transformers: { icon: IconOpenlayers },
  ollama: { icon: IconOllama },

  // Data / ML
  postgresql: { icon: IconPostgresql, darkModeGrayscale: true },
  postgres: { icon: IconPostgresql },
  redis: { icon: IconRedis, lightModeOverrideColor: "#FF4438" },
  pytorch: { icon: IconPytorch },
  tensorflow: { icon: IconTensorflow },
  numpy: { icon: IconNumpy },
  pandas: { icon: IconPandas },
  jupyter: { icon: IconJupyter },
  seaborn: { icon: IconSeaborn, darkModeGrayscale: true },
  "scikit-learn": { icon: IconScikitLearn, darkModeGrayscale: true },
  matplotlib: { icon: IconMatplotlib, darkModeGrayscale: true },
  duckdb: { icon: IconDuckdb, darkModeGrayscale: true },
  huggingface: { icon: IconHuggingFace, darkModeGrayscale: true },
  "hugging face": { icon: IconHuggingFace, darkModeGrayscale: true },
  mlflow: { icon: IconMlflow, lightModeOverrideColor: "#0194E2" },
  sqlite: { icon: IconSQLite },

  // Infra / DevOps
  docker: { icon: IconDocker, lightModeOverrideColor: "#2496ED" },
  kubernetes: { icon: IconKubernetes, darkModeGrayscale: true },
  terraform: { icon: IconTerraform },
  aws: { icon: IconAws },
  gcp: { icon: IconGoogleCloud },
  cloudflare: { icon: IconCloudflare, darkModeGrayscale: true },
  vercel: { icon: IconVercel },
  github: { icon: IconGithub },
  "github actions": { icon: IconGithubActions },
  githubactions: { icon: IconGithubActions },
  linux: { icon: IconLinux, darkModeGrayscale: true },
  nginx: { icon: IconNginx, lightModeOverrideColor: "#009639" },
  prometheus: { icon: IconPrometheus },
  grafana: { icon: IconGrafana },
  loki: { icon: IconLoki },
  tailscale: { icon: IconTailscale },
  helm: { icon: IconHelm },

  // Social / contact (profile links)
  linkedin: { icon: IconLinkedin },
  gmail: { icon: IconGmail },
  x: { icon: IconX },
  twitter: { icon: IconX },
} as const satisfies Record<string, BrandIconEntry>;

export type BrandIconName = keyof typeof BRAND_ICONS;

/**
 * Names intentionally left as letter fallback (no catalog glyph).
 * Prefer adding a ~icons/devicon|logos|simple-icons entry instead.
 */
export const INTENTIONAL_LETTER_FALLBACKS = new Set<string>();

export function getBrandIconEntry(name: string): BrandIconEntry | null {
  const key = name.toLowerCase().trim() as BrandIconName;
  return BRAND_ICONS[key] ?? null;
}

/**
 * Validate that every project/skill/social name resolves in the catalog.
 * Call from content loaders; unknown names still letter-fallback at runtime.
 */
export function missingBrandIcons(names: Iterable<string>): string[] {
  const missing: string[] = [];
  for (const name of names) {
    const key = name.toLowerCase().trim();
    if (INTENTIONAL_LETTER_FALLBACKS.has(key)) continue;
    if (!getBrandIconEntry(name)) missing.push(name);
  }
  return missing;
}

/** Fail fast when profile/projects introduce an unmapped brand name. */
export function assertBrandCatalogCoverage(names: Iterable<string>): void {
  const missing = missingBrandIcons(names);
  if (missing.length > 0) {
    throw new Error(`Brand icon catalog missing entries for: ${[...new Set(missing)].join(", ")}`);
  }
}
