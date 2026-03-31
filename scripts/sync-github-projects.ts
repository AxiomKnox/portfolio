import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import type { Project } from "../src/types/project"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const manifestPath = path.join(root, "src/content/github-sync.manifest.json")
const projectsPath = path.join(root, "src/content/projects.json")

interface ManifestEntry {
  slug: string
  github: string
  applyDescriptionToSummary?: boolean
}

interface Manifest {
  entries: ManifestEntry[]
}

interface GitHubRepo {
  name: string
  html_url: string
  homepage: string | null
  description: string | null
}

async function fetchRepo(fullName: string, token: string | undefined) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "portfolio-static-sync",
    "X-GitHub-Api-Version": "2022-11-28",
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`https://api.github.com/repos/${fullName}`, {
    headers,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(
      `GitHub API ${response.status} for ${fullName}: ${text.slice(0, 200)}`
    )
  }

  return response.json() as Promise<GitHubRepo>
}

async function run() {
  const write = process.argv.includes("--write")
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Manifest
  const projects = JSON.parse(readFileSync(projectsPath, "utf8")) as Project[]

  if (manifest.entries.length === 0) {
    console.log(
      "sync-github-projects: no entries in github-sync.manifest.json — nothing to do."
    )
    return
  }

  const token = process.env.GITHUB_TOKEN
  if (!token) {
    console.warn(
      "sync-github-projects: GITHUB_TOKEN not set — unauthenticated requests are rate-limited (60/hr)."
    )
  }

  const bySlug = new Map(projects.map((project) => [project.slug, project]))

  for (const entry of manifest.entries) {
    const current = bySlug.get(entry.slug)
    if (!current) {
      console.warn(`sync-github-projects: unknown slug "${entry.slug}" — skip`)
      continue
    }

    const repo = await fetchRepo(entry.github, token)
    const next: Project = {
      ...current,
      name: repo.name ?? current.name,
      repositoryUrl: repo.html_url,
      websiteUrl: repo.homepage?.trim() || current.websiteUrl,
    }

    if (entry.applyDescriptionToSummary && repo.description) {
      next.summary = repo.description
    }

    bySlug.set(entry.slug, next)
    console.log(`sync-github-projects: fetched ${entry.github} → ${entry.slug}`)
  }

  const nextList = projects.map((project) => bySlug.get(project.slug) ?? project)

  if (!write) {
    console.log(
      "sync-github-projects: dry run — pass --write to update src/content/projects.json"
    )
    return
  }

  writeFileSync(projectsPath, `${JSON.stringify(nextList, null, 2)}\n`, "utf8")
  console.log("sync-github-projects: wrote src/content/projects.json")
}

run().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
