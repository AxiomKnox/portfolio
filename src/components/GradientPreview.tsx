import { resolvePreviewGradientId } from "@/lib/preview";

export function GradientPreview({
  id,
  className = "",
  label,
}: {
  id: string;
  className?: string;
  label?: string;
}) {
  const gradientId = resolvePreviewGradientId(id);
  return (
    <div
      className={`gradient-preview relative overflow-hidden ${className}`}
      data-gradient={gradientId}
    >
      <div className="absolute inset-0 bg-grid opacity-30 mix-blend-overlay" />
      {label ? (
        <span className="gradient-preview-label absolute bottom-2 left-3 font-mono text-[10px] uppercase tracking-wider">
          {label}
        </span>
      ) : null}
    </div>
  );
}
