import { DownloadSimple } from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface SkillGroup {
  title: string
  items: string[]
}

const skillGroups: SkillGroup[] = [
  {
    title: "Backend & APIs",
    items: [
      "Go / Rust services",
      "PostgreSQL modeling",
      "Redis pub/sub & caching",
      "REST + JSON Schema",
    ],
  },
  {
    title: "DevOps & platform",
    items: [
      "Terraform / OpenTofu",
      "Kubernetes + GitOps",
      "GitHub Actions / CI hygiene",
      "Observability baselines",
    ],
  },
  {
    title: "Practices",
    items: [
      "SLOs & error budgets",
      "Progressive delivery",
      "Security reviews",
      "Documentation that ages well",
    ],
  },
]

const resumeSrc = `${import.meta.env.BASE_URL}resume.pdf`

export function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 sm:pt-12">
      <header className="max-w-2xl space-y-3 animate-in fade-in duration-500">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">
          About
        </p>
        <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
          Taylor Rivera
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Backend engineer &amp; DevOps practitioner · shipping calm systems
        </p>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-700">
          <h2 className="font-display text-xl tracking-tight">Summary</h2>
          <Separator />
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>
              I have spent the last decade shipping platforms where reliability
              is a feature: accounting-grade APIs, telemetry ingest, auth
              gateways, and the Terraform/Argo machinery that keeps them
              observable and recoverable.
            </p>
            <p>
              I care about clear boundaries, measurable rollouts, and docs that
              help the next person at 3am. This site is static on purpose—what
              you see is built from data in the repo, ready for GitHub Pages.
            </p>
          </div>
          <Button render={<a href={resumeSrc} download />} variant="outline">
            Download resume PDF
            <DownloadSimple aria-hidden className="size-4" weight="bold" />
          </Button>
        </section>

        <section className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-700">
          <h2 className="font-display text-xl tracking-tight">Skills</h2>
          <Separator />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            {skillGroups.map((group) => (
              <div key={group.title} className="space-y-3">
                <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground">
                  {group.title}
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li key={item}>
                      <Badge variant="secondary">{item}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-16 space-y-4">
        <h2 className="font-display text-xl tracking-tight">Resume</h2>
        <Separator />
        <p className="text-sm text-muted-foreground">
          Embedded PDF from{" "}
          <code className="rounded-none bg-muted px-1 py-0.5 font-mono text-[11px]">
            public/resume.pdf
          </code>
          . Replace that file with your own export.
        </p>
        <div className="overflow-hidden border border-border/80 bg-card/40 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
          <iframe
            className="h-[min(70vh,820px)] w-full"
            src={resumeSrc}
            title="Resume PDF"
          />
        </div>
      </section>
    </div>
  )
}
