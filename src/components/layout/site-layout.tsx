import { Outlet } from "react-router-dom"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"

export function SiteLayout() {
  return (
    <div className="relative flex min-h-svh flex-col">
      <div aria-hidden className="site-grain pointer-events-none fixed inset-0 z-[1] opacity-[0.14]" />
      <div className="relative z-10 flex min-h-svh flex-col">
        <SiteHeader />
        <main className="flex-1">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
    </div>
  )
}
