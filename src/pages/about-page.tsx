import { AppIcon } from "@/components/ui/app-icon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { site } from "@/lib/site"

export function AboutPage() {
  const { person, skills } = site
  const resumeSrc = `${import.meta.env.BASE_URL}${person.resumeFile}`

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 sm:pt-12">
      <header className="max-w-2xl space-y-3 animate-in fade-in duration-500">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">
          About
        </p>
        <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
          {person.displayName}
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {person.roleLine}
        </p>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-700">
          <h2 className="font-display text-xl tracking-tight">Summary</h2>
          <Separator />
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {person.summaryParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 border border-border/40 bg-card/20 p-3">
            <p className="w-full font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Resume
            </p>
            <Button
              render={
                <a href={resumeSrc} rel="noreferrer" target="_blank" />
              }
              size="sm"
              variant="default"
            >
              Open PDF
              <AppIcon aria-hidden className="size-3.5" icon="mdi:open-in-new" />
            </Button>
            <Button render={<a href={resumeSrc} download />} size="sm" variant="outline">
              Download
              <AppIcon aria-hidden className="size-3.5" icon="mdi:tray-arrow-down" />
            </Button>
          </div>
        </section>

        <section className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-700">
          <h2 className="font-display text-xl tracking-tight">Skills</h2>
          <Separator />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            {skills.map((group) => (
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

      <details className="group/resume mt-14 rounded-none border border-border/35 bg-card/15 open:border-border/55">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
          <span>Inline resume preview</span>
          <AppIcon
            aria-hidden
            className="size-4 shrink-0 transition-transform group-open/resume:rotate-180"
            icon="mdi:chevron-down"
          />
        </summary>
        <div className="border-t border-border/25 px-4 pb-4 pt-3">
          <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
            Optional embedded view. Replace{" "}
            <code className="rounded-none bg-muted px-1 py-0.5 font-mono text-[10px]">
              public/{person.resumeFile}
            </code>{" "}
            with your PDF. Some browsers block PDFs in iframes; use Open PDF if
            the preview is blank.
          </p>
          <div className="overflow-hidden rounded-none bg-muted/20 ring-1 ring-foreground/8">
            <iframe
              className="h-[min(42vh,420px)] w-full"
              src={resumeSrc}
              title="Resume PDF preview"
            />
          </div>
        </div>
      </details>
    </div>
  )
}
