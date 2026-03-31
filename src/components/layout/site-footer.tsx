import { AppIcon } from "@/components/ui/app-icon"
import { site } from "@/lib/site"

export function SiteFooter() {
  const { contact, footer } = site

  return (
    <footer className="mt-auto border-t border-border/80 bg-background/90">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="font-mono text-[11px] text-muted-foreground">
          {footer.note}
        </p>
        <a
          className="inline-flex items-center gap-1.5 font-mono text-[11px] text-foreground underline-offset-4 hover:underline"
          href={contact.githubUrl}
          rel="noreferrer"
          target="_blank"
        >
          {footer.linkLabel}
          <AppIcon aria-hidden className="size-3.5" icon="mdi:open-in-new" />
        </a>
      </div>
    </footer>
  )
}
