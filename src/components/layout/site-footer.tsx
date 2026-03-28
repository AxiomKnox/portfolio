import { ArrowSquareOut } from "@phosphor-icons/react"

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/80 bg-background/90">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="font-mono text-[11px] text-muted-foreground">
          Static site · Built with Vite &amp; React · Deploy anywhere
        </p>
        <a
          className="inline-flex items-center gap-1.5 font-mono text-[11px] text-foreground underline-offset-4 hover:underline"
          href="https://github.com"
          rel="noreferrer"
          target="_blank"
        >
          GitHub
          <ArrowSquareOut aria-hidden className="size-3.5" weight="bold" />
        </a>
      </div>
    </footer>
  )
}
