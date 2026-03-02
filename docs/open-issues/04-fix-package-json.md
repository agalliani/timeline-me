# Agent Task: Fix Package Name and Audit `package.json`

## Context

You are working on **Timeline Me**, a Next.js (App Router, static export) web application deployed to GitHub Pages at `https://agalliani.github.io/timeline-me`. The stack is: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Shadcn/UI.

Before starting, read:
- `AI_AGENTS.md` — commit convention and AI workflow rules.
- `package.json` — the current package manifest.

## Problem Description

The `package.json` currently has:
```json
{
  "name": "next-app-temp",
  ...
}
```

`"next-app-temp"` is a placeholder name from the project scaffolding and does not represent the actual project. This is a form of technical debt that misleads developers and tools.

Additionally, conduct a broader audit of the `package.json` for any other issues.

## Your Task

### 1. Fix the package name

Change `"name": "next-app-temp"` to `"name": "timeline-me"`.

### 2. Audit dependencies

Check the following:

- **`html2canvas`** (`^1.4.1`) vs **`html-to-image`** (`^1.11.13`): The screenshot functionality in `src/components/timeline-app.tsx` uses `toPng` from `html-to-image`. Search the entire codebase for any import or usage of `html2canvas`. If `html2canvas` is not used anywhere, remove it from `dependencies`.

- **`@hookform/resolvers`** (`^5.2.2`): Verify this is used in conjunction with `react-hook-form` and `zod` in the timeline form. Search for `@hookform/resolvers` imports. If unused, remove.

- **`next-themes`** (`^0.4.6`): Check if dark mode theme switching is wired up in the app. Search for `useTheme`, `ThemeProvider`, or `next-themes` imports in components. If it is installed but not yet integrated, document this gap.

- **`radix-ui`** (`^1.4.3`): Shadcn/UI components already use individual `@radix-ui/*` packages under the hood (via `components/ui/`). Verify if the top-level `radix-ui` package is explicitly imported anywhere; if not, remove it.

### 3. Fix the `"lint"` script

The current lint script is `"lint": "eslint"` — this will lint nothing without a target. Update to:
```json
"lint": "next lint"
```
This uses the built-in Next.js ESLint integration, consistent with the project's `eslint.config.mjs`.

### 4. Run `npm install` after dependency changes

After removing any unused packages, run `npm install` to update `package-lock.json`.

### 5. Run `npm run build`

Confirm the build succeeds after all changes.

### 6. Update the documentation

- If `docs/guides/` does not contain a development guide, create `docs/guides/DEVELOPMENT.md` with:
  - Setup instructions (clone, `npm install`, `npm run dev`).
  - Available scripts (`dev`, `build`, `lint`).
  - Notes on any removed packages and why.

### 7. Commit using Conventional Commits

- `chore(package): rename package from next-app-temp to timeline-me`
- `chore(deps): remove unused html2canvas and radix-ui top-level deps`
- `chore(scripts): fix lint script to use next lint`

## Acceptance Criteria

- [ ] `package.json` `name` field is `"timeline-me"`.
- [ ] `html2canvas` removed if confirmed unused.
- [ ] `radix-ui` top-level removed if confirmed unused.
- [ ] `"lint": "next lint"` in scripts.
- [ ] `npm run build` exits cleanly.
- [ ] `docs/guides/DEVELOPMENT.md` created.
