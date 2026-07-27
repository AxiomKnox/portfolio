import { useEffect, useRef } from "react";

/**
 * Hero grid: static line grid confined to the right side of the hero, with
 * expanding ripple pulses on cursor interaction. No continuous distortion
 * or line movement — idle grid is completely static. Ripples brighten lines
 * they cross and fade out; RAF stops when no ripples are active.
 *
 * Respects `html[data-motion="reduced"]` (draws static grid only).
 */
export function HeroGrid() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const CELL = 44;

    type Ripple = { x: number; y: number; t0: number };
    const RIPPLE_LIFE = 900; // ms
    const RIPPLE_MAX_R = 220; // px
    const RIPPLE_WIDTH = 40; // ring thickness at half life
    const ripples: Ripple[] = [];

    const resize = () => {
      // Size from the canvas's CSS box (72% / inset-y-0). Do not override
      // style.width/height — that was expanding to full wrap and causing CLS.
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(() => {
      resize();
      renderStatic();
    });
    ro.observe(wrap);

    const readColor = () => {
      const cs = getComputedStyle(document.documentElement);
      return cs.getPropertyValue("--foreground").trim() || "oklch(0.15 0 0)";
    };

    const isReduced = () => document.documentElement.getAttribute("data-motion") === "reduced";

    const drawBaseGrid = (alpha = 0.11) => {
      const color = readColor();
      ctx.lineWidth = 1;
      ctx.lineCap = "round";
      ctx.strokeStyle = `color-mix(in oklab, ${color} ${(alpha * 100).toFixed(1)}%, transparent)`;

      for (let gx = 0; gx <= width; gx += CELL) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, height);
        ctx.stroke();
      }
      for (let gy = 0; gy <= height; gy += CELL) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(width, gy);
        ctx.stroke();
      }
    };

    const drawRipple = (r: Ripple, now: number) => {
      const age = now - r.t0;
      const p = age / RIPPLE_LIFE;
      if (p >= 1) return;
      const eased = 1 - (1 - p) ** 3; // easeOutCubic
      const radius = eased * RIPPLE_MAX_R;
      const alpha = (1 - p) * 0.55; // fade
      const color = readColor();

      // Radial gradient stroke ring — brightens grid area it overlaps.
      const inner = Math.max(0, radius - RIPPLE_WIDTH);
      const outer = radius + RIPPLE_WIDTH * 0.4;
      const grad = ctx.createRadialGradient(r.x, r.y, inner, r.x, r.y, outer);
      grad.addColorStop(0, "transparent");
      grad.addColorStop(
        0.5,
        `color-mix(in oklab, var(--color-primary) ${(alpha * 100).toFixed(1)}%, transparent)`,
      );
      grad.addColorStop(1, "transparent");

      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.beginPath();
      ctx.arc(r.x, r.y, outer, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // Re-draw brighter grid lines within the clipped ring area only.
      ctx.lineWidth = 1;
      ctx.strokeStyle = `color-mix(in oklab, ${color} ${(alpha * 55).toFixed(1)}%, transparent)`;
      for (let gx = 0; gx <= width; gx += CELL) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, height);
        ctx.stroke();
      }
      for (let gy = 0; gy <= height; gy += CELL) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(width, gy);
        ctx.stroke();
      }

      // Soft glow overlay
      ctx.fillStyle = grad;
      ctx.fillRect(r.x - outer, r.y - outer, outer * 2, outer * 2);
      ctx.restore();
    };

    let raf = 0;
    const renderStatic = () => {
      ctx.clearRect(0, 0, width, height);
      drawBaseGrid();
    };

    const tick = () => {
      const now = performance.now();
      // prune finished
      for (let i = ripples.length - 1; i >= 0; i--) {
        if (now - ripples[i].t0 >= RIPPLE_LIFE) ripples.splice(i, 1);
      }
      ctx.clearRect(0, 0, width, height);
      drawBaseGrid();
      for (const r of ripples) drawRipple(r, now);
      if (ripples.length > 0) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };

    const emitRipple = (x: number, y: number) => {
      if (isReduced()) return;
      // throttle: skip if a very recent ripple exists nearby
      const now = performance.now();
      const last = ripples[ripples.length - 1];
      if (last && now - last.t0 < 90) return;
      ripples.push({ x, y, t0: now });
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onEnter = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      emitRipple(e.clientX - rect.left, e.clientY - rect.top);
    };
    const onDown = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      emitRipple(e.clientX - rect.left, e.clientY - rect.top);
    };

    wrap.addEventListener("pointerenter", onEnter);
    wrap.addEventListener("pointerdown", onDown);

    const mo = new MutationObserver(renderStatic);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-motion"],
    });
    const onVis = () => {
      if (document.hidden && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    document.addEventListener("visibilitychange", onVis);

    renderStatic();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
      wrap.removeEventListener("pointerenter", onEnter);
      wrap.removeEventListener("pointerdown", onDown);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div ref={wrapRef} aria-hidden className="absolute inset-0 overflow-hidden">
      {/* Right-side atmospheric glow, subtle so it doesn't fight ambient modes. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 52% 50% at 76% 34%, color-mix(in oklab, var(--color-primary) 9%, transparent), transparent 72%)",
        }}
      />

      {/* Canvas grid, masked to the right side and faded at every edge so it
          blends with the page and any ambient layer underneath. */}
      <canvas
        ref={canvasRef}
        className="absolute inset-y-0 right-0 h-full w-[72%]"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 22%, black 78%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 16%, black 68%, transparent 100%), radial-gradient(ellipse 76% 66% at 66% 34%, black 14%, transparent 78%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 22%, black 78%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 16%, black 68%, transparent 100%), radial-gradient(ellipse 76% 66% at 66% 34%, black 14%, transparent 78%)",
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      />

      {/* Soft left-side wash — keeps headline legible without hiding ambient. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, color-mix(in oklab, var(--background) 55%, transparent) 0%, color-mix(in oklab, var(--background) 30%, transparent) 30%, transparent 55%)",
        }}
      />
    </div>
  );
}
