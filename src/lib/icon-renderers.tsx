/**
 * Icon renderers — paint policies only; catalogs live in icon-catalog.tsx.
 */
import type { CSSProperties } from "react";
import { getBrandIconEntry, UI_ICONS, type UiIconName } from "@/lib/icon-catalog";

// --- UI icons ---

export function UiIcon({
  name,
  className = "",
  size = 16,
}: {
  name: UiIconName;
  className?: string;
  size?: number;
}) {
  const Icon = UI_ICONS[name];
  if (!Icon) {
    throw new Error(`Unknown UI icon: ${name}`);
  }
  return <Icon className={className} width={size} height={size} aria-hidden="true" />;
}

// --- Brand icons ---

export function BrandIcon({
  name,
  size = 16,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const entry = getBrandIconEntry(name);
  if (!entry) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-sm bg-muted font-mono text-[10px] text-muted-foreground ${className}`}
        style={{ width: size, height: size }}
      >
        {name.slice(0, 1).toUpperCase()}
      </span>
    );
  }

  const { icon: Icon, lightModeOverrideColor, darkModeGrayscale } = entry;
  const overrideStyle: CSSProperties | undefined = lightModeOverrideColor
    ? { ["--brand-icon-light-mode-override" as string]: lightModeOverrideColor }
    : undefined;

  return (
    <Icon
      className={`brand-icon inline-block shrink-0 ${className}`}
      width={size}
      height={size}
      role="img"
      aria-label={name}
      data-light-mode-override={lightModeOverrideColor ? "" : undefined}
      data-dark-mode-grayscale={darkModeGrayscale ? "" : undefined}
      style={overrideStyle}
    />
  );
}
