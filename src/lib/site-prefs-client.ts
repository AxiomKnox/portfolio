/**
 * Client bootstrap for theme / motion / ambient prefs under View Transitions.
 * Module script — runs once; listeners survive ClientRouter navigations.
 * Uses event delegation so persist/remount cannot leave dead toggle buttons.
 */
import { withBase } from "@/lib/base";
import {
  isMotionReduced,
  MOTION_STORAGE_KEY,
  type MotionEffective,
  resolveMotionPreference,
} from "@/lib/motion-preference";
import {
  clearProjectBackPath,
  DEFAULT_PAGE_TRANSITION,
  getProjectBackPath,
  PAGE_TRANSITION_ATTR,
  PAGE_TRANSITION_SKIP_ATTR,
  rememberProjectBackPath,
  shouldSkipPageTransitionAnimations,
  shouldUseHistoryBackForProject,
  stripBaseFromPath,
} from "@/lib/page-transition";

const THEME_KEY = "theme";
const AMBIENT_DARK_KEY = "ambient-mode-dark";
const AMBIENT_LIGHT_KEY = "ambient-mode-light";

type AmbientMode = "off" | "glow" | "stars" | "shapes";

declare global {
  interface Window {
    __sitePrefsInit?: boolean;
  }
}

function readTheme(): "light" | "dark" {
  try {
    const t = localStorage.getItem(THEME_KEY);
    if (t === "light" || t === "dark") return t;
  } catch {
    /* ignore */
  }
  return "dark";
}

function applyTheme(root: HTMLElement, theme: "light" | "dark" = readTheme()) {
  root.classList.toggle("dark", theme === "dark");
}

function readStoredMotion(): string | null {
  try {
    return localStorage.getItem(MOTION_STORAGE_KEY);
  } catch {
    return null;
  }
}

function osPrefersReducedMotion(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function readMotionEffective(): MotionEffective {
  return resolveMotionPreference({
    stored: readStoredMotion(),
    osPrefersReduced: osPrefersReducedMotion(),
  });
}

function readMotionReduced(): boolean {
  return isMotionReduced(readMotionEffective());
}

function applyMotion(root: HTMLElement, effective: MotionEffective = readMotionEffective()) {
  root.setAttribute("data-motion", effective);
}

function applyPageTransition(root: HTMLElement) {
  root.setAttribute(PAGE_TRANSITION_ATTR, DEFAULT_PAGE_TRANSITION);
  root.toggleAttribute(
    PAGE_TRANSITION_SKIP_ATTR,
    shouldSkipPageTransitionAnimations({
      dataMotion: root.getAttribute("data-motion"),
    }),
  );
}

function applyAllPrefs(root: HTMLElement) {
  applyTheme(root);
  applyMotion(root);
  applyPageTransition(root);
}

/** Prefer HTML `hidden` — Tailwind `hidden` can lose to display utilities. */
function setHidden(el: Element | null, hide: boolean) {
  if (!el) return;
  el.toggleAttribute("hidden", hide);
  el.classList.toggle("hidden", hide);
}

function paintThemeToggleIcons(theme: "light" | "dark" = readTheme()) {
  const sun = document.getElementById("theme-icon-sun");
  const moon = document.getElementById("theme-icon-moon");
  if (!sun || !moon) return;
  // Dark theme → show sun (switch to light); light → show moon.
  setHidden(sun, theme !== "dark");
  setHidden(moon, theme === "dark");
}

function paintMotionToggle(reduced: boolean = readMotionReduced()) {
  const btn = document.getElementById("motion-toggle");
  const icon = document.getElementById("motion-icon");
  if (!btn) return;
  btn.setAttribute("aria-pressed", reduced ? "true" : "false");
  btn.setAttribute("aria-label", reduced ? "Enable motion" : "Reduce motion");
  btn.title = reduced ? "Motion reduced" : "Motion on";
  btn.classList.toggle("text-muted-foreground/50", reduced);
  btn.classList.toggle("text-muted-foreground", !reduced);
  icon?.classList.toggle("opacity-50", reduced);
}

function isDarkTheme(): boolean {
  return document.documentElement.classList.contains("dark");
}

function readAmbientMode(): AmbientMode {
  const dark = isDarkTheme();
  try {
    const v = localStorage.getItem(dark ? AMBIENT_DARK_KEY : AMBIENT_LIGHT_KEY);
    if (dark) return v === "glow" || v === "stars" ? v : "off";
    return v === "shapes" ? "shapes" : "off";
  } catch {
    return "off";
  }
}

function paintAmbientToggle(mode: AmbientMode = readAmbientMode()) {
  const btn = document.getElementById("ambient-toggle");
  const off = document.getElementById("ambient-icon-off");
  const active = document.getElementById("ambient-icon-active");
  const stars = document.getElementById("ambient-icon-stars");
  if (!btn || !off || !active || !stars) return;

  const showOff = mode === "off";
  const showStars = mode === "stars";
  const showActive = mode === "glow" || mode === "shapes";

  setHidden(off, !showOff);
  setHidden(active, !showActive);
  setHidden(stars, !showStars);

  btn.setAttribute("aria-label", `Ambient: ${mode}. Click to cycle.`);
  btn.title = `Ambient: ${mode}`;
}

function paintAllToggles() {
  paintThemeToggleIcons();
  paintMotionToggle();
  paintAmbientToggle();
}

function pathWithoutBase(pathname: string): string {
  return stripBaseFromPath(pathname, import.meta.env.BASE_URL ?? "/");
}

/** Exported for unit tests. */
export function isNavActive(href: string, path: string): boolean {
  if (href === "/") return path === "/" || path === "";
  return path === href || path.startsWith(`${href}/`);
}

function syncNavbarActive() {
  const path = pathWithoutBase(location.pathname);
  document.querySelectorAll<HTMLElement>("[data-nav-path]").forEach((el) => {
    const href = el.getAttribute("data-nav-path");
    if (!href) return;
    const active = isNavActive(href, path);
    el.dataset.navActive = active ? "true" : "false";
    // Force exclusive text color classes (persist can leave both).
    if (active) {
      el.classList.remove("text-muted-foreground", "hover:text-foreground");
      el.classList.add("text-foreground");
      el.setAttribute("aria-current", "page");
    } else {
      el.classList.remove("text-foreground");
      el.classList.add("text-muted-foreground", "hover:text-foreground");
      el.removeAttribute("aria-current");
    }
  });
}

/** Point detail Back at the remembered list URL (incl. query); cold entry keeps /projects. */
function syncProjectBackLink() {
  const el = document.querySelector<HTMLAnchorElement>("[data-project-back]");
  if (!el) return;
  const stored = getProjectBackPath();
  if (!stored) return;
  const qIdx = stored.indexOf("?");
  const path = qIdx >= 0 ? stored.slice(0, qIdx) : stored;
  const search = qIdx >= 0 ? stored.slice(qIdx) : "";
  el.href = `${withBase(path)}${search}`;
}

function isModifiedClick(event: MouseEvent): boolean {
  return (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}

function cycleTheme() {
  const next = readTheme() === "dark" ? "light" : "dark";
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    /* ignore */
  }
  applyTheme(document.documentElement, next);
  paintThemeToggleIcons(next);
  paintAmbientToggle();
}

function cycleMotion() {
  const next: MotionEffective = readMotionReduced() ? "full" : "reduced";
  try {
    localStorage.setItem(MOTION_STORAGE_KEY, next);
  } catch {
    /* ignore */
  }
  applyMotion(document.documentElement, next);
  applyPageTransition(document.documentElement);
  paintMotionToggle(isMotionReduced(next));
}

function cycleAmbient() {
  const dark = isDarkTheme();
  const mode = readAmbientMode();
  let next: AmbientMode;
  if (dark) {
    next = mode === "off" ? "glow" : mode === "glow" ? "stars" : "off";
  } else {
    next = mode === "shapes" ? "off" : "shapes";
  }
  try {
    localStorage.setItem(dark ? AMBIENT_DARK_KEY : AMBIENT_LIGHT_KEY, next);
  } catch {
    /* ignore */
  }
  paintAmbientToggle(next);
  window.dispatchEvent(new Event("ambient-style-change"));
}

function onDocumentClick(event: MouseEvent) {
  const target = event.target as Element | null;
  if (!target) return;

  if (target.closest("#theme-toggle")) {
    event.preventDefault();
    cycleTheme();
    return;
  }
  if (target.closest("#motion-toggle")) {
    event.preventDefault();
    cycleMotion();
    return;
  }
  if (target.closest("#ambient-toggle")) {
    event.preventDefault();
    cycleAmbient();
    return;
  }

  const back = target.closest("[data-project-back]");
  if (back instanceof HTMLAnchorElement) {
    if (!shouldUseHistoryBackForProject() || isModifiedClick(event)) return;
    event.preventDefault();
    clearProjectBackPath();
    history.back();
    return;
  }

  // Belt-and-suspenders: remember list→detail before ClientRouter navigates.
  const anchor = target.closest("a[href]");
  if (!(anchor instanceof HTMLAnchorElement) || isModifiedClick(event)) return;
  try {
    const url = new URL(anchor.href, location.href);
    if (url.origin !== location.origin) return;
    rememberProjectBackPath(
      pathWithoutBase(location.pathname),
      pathWithoutBase(url.pathname),
      location.search,
    );
  } catch {
    /* ignore */
  }
}

function onMotionAttrChange() {
  applyPageTransition(document.documentElement);
  paintMotionToggle();
}

function refreshAfterNavigation() {
  applyAllPrefs(document.documentElement);
  paintAllToggles();
  syncNavbarActive();
  syncProjectBackLink();
  applyPageTransition(document.documentElement);
}

export function initSitePrefs() {
  if (window.__sitePrefsInit) return;
  window.__sitePrefsInit = true;

  let focusMainAfterNav = false;

  applyAllPrefs(document.documentElement);
  paintAllToggles();
  syncNavbarActive();
  syncProjectBackLink();

  document.addEventListener("click", onDocumentClick);

  document.addEventListener("astro:before-preparation", (event) => {
    const ev = event as Event & { from?: URL; to?: URL };
    if (!ev.from || !ev.to) return;
    rememberProjectBackPath(
      pathWithoutBase(ev.from.pathname),
      pathWithoutBase(ev.to.pathname),
      ev.from.search,
    );
  });

  document.addEventListener("astro:before-swap", (event) => {
    const ev = event as Event & { newDocument: Document };
    applyAllPrefs(ev.newDocument.documentElement);
  });

  document.addEventListener("astro:after-swap", () => {
    refreshAfterNavigation();
    focusMainAfterNav = true;
  });

  const onPageLoad = () => {
    refreshAfterNavigation();
    if (focusMainAfterNav) {
      focusMainAfterNav = false;
      const main = document.getElementById("main-content");
      if (main) {
        if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
        main.focus({ preventScroll: true });
      }
    }
  };

  document.addEventListener("astro:page-load", onPageLoad);
  // In case this module loads after the initial `astro:page-load`.
  if (document.getElementById("theme-toggle") || document.getElementById("ambient-toggle")) {
    onPageLoad();
  }

  const obs = new MutationObserver(onMotionAttrChange);
  obs.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-motion"],
  });
}

/** Call from Layout `<script>` — keeps the client bundle from being tree-shaken. */
export function bootSitePrefs() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (!document.documentElement.getAttribute(PAGE_TRANSITION_ATTR)) {
    document.documentElement.setAttribute(PAGE_TRANSITION_ATTR, DEFAULT_PAGE_TRANSITION);
  }
  initSitePrefs();
}
