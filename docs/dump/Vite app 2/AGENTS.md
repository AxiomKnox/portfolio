# AGENTS.md

## Project Overview
- **Tech Stack**: Bun, Vite, React, TypeScript, Tailwind CSS, ShadCN
- **Goal**: A responsive Portfolio web application for GitHub Pages.

## Development Environment
- **Install**: `bun install`
- **Dev Server**: `bun run dev`
- **Build**: `bun run build`
- **Lint**: `bun run lint`
- **Test**: `bun run test`

## Code Style & Standards
- **Formatting**: Use Prettier. No semicolons, 2-space indentation.
- **Naming**: Use `kebab-case` for files and folders. Use `PascalCase` for React components.
- **TypeScript**: All props and state must be typed. Prefer interfaces over types.
- **React**: Use functional components and hooks. Keep components small and focused.
- **Shadcn**: Use shadcn components in many places. Modify components in codebase to suit Design.

## Git & Workflow
- **Commits**: Use conventional commits (e.g., `feat: add login button`, `fix: resolve login error`).
- **PRs**: Title format: `[Component] Brief description`. Always link to the related issue.
- **Branches**: Feature branches from `main`. Name: `feature/descriptive-name`.

## Security & Reliability
- **Never** commit API keys or secrets.
- Validate all user inputs.
- Handle errors gracefully with user-friendly messages.   