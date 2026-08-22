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

const resumePdfModules = import.meta.glob<string>("/src/content/profile/resume.pdf", {
  eager: true,
  query: "?url",
  import: "default",
});

/**
 * Retrieves metadata for a project's preview image.
 *
 * @param projectId - The project's identifier
 * @param preview - The preview image filename
 * @returns The preview image metadata, or `undefined` when the filename is invalid or the image cannot be found
 */
export function getProjectPreviewMetadata(
  projectId: string,
  preview: string,
): ImageMetadata | undefined {
  if (!isPreviewImage(preview)) return undefined;
  const key = `/src/content/projects/${projectId}/${preview}`;
  return projectPreviewModules[key]?.default;
}

/**
 * Resolves metadata for the profile photo.
 *
 * @param profilePhoto - The profile photo filename.
 * @returns The profile photo metadata when `profilePhoto` is `profile_photo.png`, `undefined` otherwise.
 */
export function getProfilePhotoMetadata(
  profilePhoto: string | undefined,
): ImageMetadata | undefined {
  if (profilePhoto !== "profile_photo.png") return undefined;
  return profilePhotoModules["/src/content/profile/profile_photo.png"]?.default;
}

/**
 * Resolves the synced resume PDF to its URL.
 *
 * @param resume - The resume filename to resolve
 * @returns The resume URL if `resume` is `resume.pdf` and a non-empty URL is available, `undefined` otherwise
 */
export function getResumePdfUrl(resume: string | undefined): string | undefined {
  if (resume !== "resume.pdf") return undefined;
  const mod = resumePdfModules["/src/content/profile/resume.pdf"] as unknown;
  if (typeof mod === "string" && mod.length > 0) return mod;
  if (mod && typeof mod === "object" && "default" in mod) {
    const url = (mod as { default: unknown }).default;
    if (typeof url === "string" && url.length > 0) return url;
  }
  return undefined;
}

/**
 * Optimizes a project preview image to the requested dimensions.
 *
 * @param projectId - The project identifier used to locate the preview image
 * @param preview - The preview filename
 * @param opts - The target image dimensions
 * @returns Optimized image attributes, or `undefined` when the preview cannot be resolved
 */
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
