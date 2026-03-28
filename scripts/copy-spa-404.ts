import { copyFileSync, existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist")
const indexHtml = path.join(dist, "index.html")
const notFoundHtml = path.join(dist, "404.html")

if (!existsSync(indexHtml)) {
  console.error("copy-spa-404: dist/index.html not found. Run vite build first.")
  process.exit(1)
}

copyFileSync(indexHtml, notFoundHtml)
console.log("copy-spa-404: wrote dist/404.html for GitHub Pages SPA routing")
