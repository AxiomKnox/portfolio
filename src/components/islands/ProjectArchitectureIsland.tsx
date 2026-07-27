import { lazy, Suspense, useState } from "react";
import { StepsAccordion } from "@/components/StepsAccordion";
import type { ProjectArchitecture } from "@/content/types";

/** Lazy so ReactFlow stays out of the island chunk until a live diagram mounts. */
const ArchitectureDiagram = lazy(() =>
  import("@/components/ArchitectureDiagram").then((m) => ({ default: m.ArchitectureDiagram })),
);

function ArchitectureFallback() {
  return (
    <div className="mt-8 rounded-lg border border-dashed border-border bg-card/40 px-6 py-16 text-center">
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        /architecture
      </p>
      <p className="mt-3 text-sm text-muted-foreground">
        Interactive diagram unavailable for this project yet.
      </p>
    </div>
  );
}

function ArchitectureLive({ architecture }: { architecture: ProjectArchitecture }) {
  const [selected, setSelected] = useState<string | null>(architecture.steps[0]?.id ?? null);

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Suspense
          fallback={
            <div className="flex h-[420px] items-center justify-center rounded-lg border border-border bg-card/40">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Loading diagram…
              </p>
            </div>
          }
        >
          <ArchitectureDiagram
            architecture={architecture}
            selectedId={selected}
            onSelect={setSelected}
          />
        </Suspense>
      </div>
      <div>
        <StepsAccordion steps={architecture.steps} selectedId={selected} onSelect={setSelected} />
      </div>
    </div>
  );
}

export default function ProjectArchitectureIsland({
  architecture,
}: {
  architecture?: ProjectArchitecture | null;
}) {
  if (architecture == null) {
    return <ArchitectureFallback />;
  }
  return <ArchitectureLive architecture={architecture} />;
}
