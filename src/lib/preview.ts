/** Domain `preview` values that mean a real raster (not a GradientPreview token). */
export function isPreviewImage(preview: string): boolean {
  return preview === "preview.png" || preview === "preview.webp";
}

/** Registered GradientPreview tokens — paint lives in `src/styles.css` (`--preview-grad-*`). */
export const PREVIEW_GRADIENT_IDS = [
  "grad-1",
  "grad-2",
  "grad-3",
  "grad-4",
  "grad-5",
  "grad-6",
  "grad-avatar",
] as const;

export type PreviewGradientId = (typeof PREVIEW_GRADIENT_IDS)[number];

const PREVIEW_GRADIENT_SET: ReadonlySet<string> = new Set(PREVIEW_GRADIENT_IDS);

/** Unknown ids fall back to `grad-1` (same as the former GRADIENTS map). */
export function resolvePreviewGradientId(id: string): PreviewGradientId {
  return PREVIEW_GRADIENT_SET.has(id) ? (id as PreviewGradientId) : "grad-1";
}
