import { useEffect, useRef, useState } from "react";
import {
  type StarsAnimationPolicy,
  starsAnimationPolicy,
  starsDevicePixelRatio,
  starsParticleCount,
} from "@/lib/ambient-stars-policy";

/**
 * Ambient background rendered once per site (mounted in root).
 * Modes per theme, cycled via AmbientToggle.astro + site-prefs-client:
 *   dark:  off → glow → stars → off
 *   light: off → shapes → off
 * Default: off.
 * Respects `html[data-motion="reduced"]` and pauses when tab is hidden.
 */

export type AmbientMode = "off" | "glow" | "stars" | "shapes";

const DARK_KEY = "ambient-mode-dark";
const LIGHT_KEY = "ambient-mode-light";

function readMode(dark: boolean): AmbientMode {
  if (typeof window === "undefined") return "off";
  const v = window.localStorage.getItem(dark ? DARK_KEY : LIGHT_KEY);
  if (dark) return v === "glow" || v === "stars" ? v : "off";
  return v === "shapes" ? "shapes" : "off";
}

export function readAmbientMode(): AmbientMode {
  if (typeof window === "undefined") return "off";
  const dark = document.documentElement.classList.contains("dark");
  return readMode(dark);
}

function isNarrowViewport(): boolean {
  try {
    return window.matchMedia("(max-width: 768px)").matches;
  } catch {
    return window.innerWidth <= 768;
  }
}

/** Canvas paint from Foundations `--ambient-star` (hex preferred for alpha stops). */
function readAmbientStarColor(): string {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--ambient-star").trim();
  return raw || "#ffffff";
}

function ambientStarStop(color: string, alpha: number): string {
  if (color.startsWith("#") && color.length === 7) {
    const r = Number.parseInt(color.slice(1, 3), 16);
    const g = Number.parseInt(color.slice(3, 5), 16);
    const b = Number.parseInt(color.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return alpha <= 0 ? "transparent" : color;
}

export function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<AmbientMode>("off");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const sync = () => {
      const dark = document.documentElement.classList.contains("dark");
      setIsDark(dark);
      setMode(readMode(dark));
    };
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    const onChange = () => sync();
    window.addEventListener("ambient-style-change", onChange);
    window.addEventListener("storage", (e) => {
      if (e.key === DARK_KEY || e.key === LIGHT_KEY) sync();
    });
    return () => {
      obs.disconnect();
      window.removeEventListener("ambient-style-change", onChange);
    };
  }, []);

  const showStars = isDark && mode === "stars";

  // Heavy canvas work only while dark+stars — glow/shapes are CSS-only.
  useEffect(() => {
    if (!showStars) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let narrow = isNarrowViewport();

    type Star = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      a: number;
      twinkle: number;
    };
    type Falling = { x: number; y: number; vx: number; vy: number; life: number; max: number };

    let stars: Star[] = [];
    let falling: Falling[] = [];

    // Cached policy inputs — never touch localStorage inside rAF.
    let cachedMode: AmbientMode = "stars";
    let cachedDark = true;
    let cachedReduced = document.documentElement.getAttribute("data-motion") === "reduced";
    let cachedHidden = document.hidden;
    let starColor = readAmbientStarColor();

    const refreshPrefs = () => {
      cachedDark = document.documentElement.classList.contains("dark");
      cachedMode = readMode(cachedDark);
      cachedReduced = document.documentElement.getAttribute("data-motion") === "reduced";
      cachedHidden = document.hidden;
      starColor = readAmbientStarColor();
    };

    const policy = (): StarsAnimationPolicy =>
      starsAnimationPolicy({
        isDark: cachedDark,
        mode: cachedMode,
        reducedMotion: cachedReduced,
        tabHidden: cachedHidden,
      });

    const seed = () => {
      const count = starsParticleCount({ width, height, narrowViewport: narrow });
      stars = new Array(count).fill(0).map(() => {
        const speed = 0.02 + Math.random() * 0.06;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: -speed * (0.6 + Math.random() * 0.6),
          vy: speed * (0.6 + Math.random() * 0.6),
          r: 0.4 + Math.random() * 1.3,
          a: 0.35 + Math.random() * 0.6,
          twinkle: Math.random() * Math.PI * 2,
        };
      });
      falling = [];
    };

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      narrow = isNarrowViewport();
      dpr = starsDevicePixelRatio({
        devicePixelRatio: window.devicePixelRatio || 1,
        narrowViewport: narrow,
      });
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let last = performance.now();
    let fallingTimer = 0;

    const drawStars = () => {
      ctx.fillStyle = starColor;
      for (const s of stars) {
        const flicker = 0.75 + Math.sin(s.twinkle) * 0.25;
        ctx.globalAlpha = s.a * flicker;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const clear = () => {
      ctx.clearRect(0, 0, width, height);
    };

    // Uncapped rAF — runs at the display refresh rate (60/120/144Hz, etc.).
    const step = (now: number) => {
      const dt = Math.min(50, now - last);
      last = now;

      const action = policy();
      if (action !== "animate") {
        clear();
        if (action === "static") drawStars();
        raf = 0;
        return;
      }

      clear();

      for (const s of stars) {
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.twinkle += 0.02;
        if (s.x < -5) s.x = width + 5;
        if (s.y > height + 5) s.y = -5;
        if (s.x > width + 5) s.x = -5;
      }
      drawStars();

      // Shooting stars are a desktop flourish — skip on narrow viewports.
      if (!narrow) {
        fallingTimer += dt;
        if (fallingTimer > 2200 + Math.random() * 3200) {
          fallingTimer = 0;
          falling.push({
            x: width * (0.6 + Math.random() * 0.5),
            y: -20,
            vx: -0.6 - Math.random() * 0.4,
            vy: 0.55 + Math.random() * 0.35,
            life: 0,
            max: 1400 + Math.random() * 900,
          });
        }
        falling = falling.filter((f) => {
          f.life += dt;
          f.x += f.vx * dt;
          f.y += f.vy * dt;
          const t = 1 - f.life / f.max;
          if (t <= 0) return false;
          const tailLen = 60;
          const grad = ctx.createLinearGradient(
            f.x,
            f.y,
            f.x - f.vx * tailLen,
            f.y - f.vy * tailLen,
          );
          grad.addColorStop(0, ambientStarStop(starColor, 0.85 * t));
          grad.addColorStop(1, ambientStarStop(starColor, 0));
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(f.x, f.y);
          ctx.lineTo(f.x - f.vx * tailLen, f.y - f.vy * tailLen);
          ctx.stroke();
          return true;
        });
      }

      raf = requestAnimationFrame(step);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      last = performance.now();
      refreshPrefs();
      const action = policy();
      if (action === "idle") {
        clear();
        return;
      }
      if (action === "static") {
        clear();
        drawStars();
        return;
      }
      raf = requestAnimationFrame(step);
    };

    const onVisibility = () => {
      refreshPrefs();
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else start();
    };

    const observer = new MutationObserver(() => start());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-motion"],
    });
    const onStyleChange = () => start();
    window.addEventListener("ambient-style-change", onStyleChange);
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("ambient-style-change", onStyleChange);
      document.removeEventListener("visibilitychange", onVisibility);
      observer.disconnect();
      // Release GPU buffer when leaving stars mode.
      canvas.width = 0;
      canvas.height = 0;
    };
  }, [showStars]);

  const showGlow = isDark && mode === "glow";
  const showShapes = !isDark && mode === "shapes";

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${
          showStars ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${
          showGlow ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="ambient-glow ambient-glow-1" />
        <span className="ambient-glow ambient-glow-2" />
        <span className="ambient-glow ambient-glow-3" />
      </div>
      <div
        className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${
          showShapes ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="ambient-blob ambient-blob-1" />
        <span className="ambient-blob ambient-blob-2" />
        <span className="ambient-blob ambient-blob-3" />
        <span className="ambient-blob ambient-blob-4" />
      </div>
    </div>
  );
}
