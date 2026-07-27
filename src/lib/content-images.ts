import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";
import type { OptimizedImageAttrs } from "@/lib/optimized-image";
import { isPreviewImage } from "@/lib/preview";

export type { OptimizedImageAttrs };
export { isPreviewImage };

const projectPreviewModules = import.meta.glob<{ default: ImageMetadata }>(
  "/src/content/projects/*/preview.{png,webp}",
  { eager: true },
);

const profilePhotoModules = import.meta.glob<{ default: ImageMetadata }>(
  "/src/content/profile/profile_photo.png",
  { eager: true },
);

export function getProjectPreviewMetadata(
  projectId: string,
  preview: string,
): ImageMetadata | undefined {
  if (!isPreviewImage(preview)) return undefined;
  const key = `/src/content/projects/${projectId}/${preview}`;
  return projectPreviewModules[key]?.default;
}

export function getProfilePhotoMetadata(
  profilePhoto: string | undefined,
): ImageMetadata | undefined {
  if (profilePhoto !== "profile_photo.png") return undefined;
  return profilePhotoModules["/src/content/profile/profile_photo.png"]?.default;
}

export async function optimizeProjectPreview(
  projectId: string,
  preview: string,
  opts: { width: number; height: number },
): Promise<OptimizedImageAttrs | undefined> {
  const src = getProjectPreviewMetadata(projectId, preview);
  if (!src) return undefined;
  const result = await getImage({
    src,
    width: opts.width,
    height: opts.height,
    fit: "cover",
  });
  return {
    src: result.src,
    width: Number(result.attributes.width),
    height: Number(result.attributes.height),
  };
}

export async function optimizeProjectPreviewMap(
  projects: ReadonlyArray<{ id: string; preview: string }>,
  opts: { width: number; height: number },
): Promise<Record<string, OptimizedImageAttrs>> {
  const entries = await Promise.all(
    projects.map(async (p) => {
      const img = await optimizeProjectPreview(p.id, p.preview, opts);
      return img ? ([p.id, img] as const) : null;
    }),
  );
  return Object.fromEntries(entries.filter((e): e is [string, OptimizedImageAttrs] => e != null));
}
