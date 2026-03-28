import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

function appBase(): string {
  const raw = process.env.VITE_BASE_URL ?? "/"
  if (raw === "/" || raw === "") {
    return "/"
  }

  return raw.endsWith("/") ? raw : `${raw}/`
}

// https://vite.dev/config/
export default defineConfig({
  base: appBase(),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
