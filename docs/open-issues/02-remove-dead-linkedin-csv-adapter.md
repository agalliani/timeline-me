# Agent Task: Remove Dead CSV LinkedIn Adapter

## Context

You are working on **Timeline Me**, a Next.js (App Router, static export) web application deployed to GitHub Pages at `https://agalliani.github.io/timeline-me`. The stack is: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Shadcn/UI.

Before starting, read:
- `AI_AGENTS.md` — commit convention and AI workflow rules.
- `src/components/linkedin-import-modal.tsx` — to understand which adapter is actually used by the UI.

## Problem Description

There are **two parallel LinkedIn import adapters**:

1. `src/lib/linkedin-pdf-adapter.ts` — Parses a **LinkedIn PDF export** by reading raw text lines extracted via `pdfjs-dist`. This is the **active, production adapter** used by `linkedin-import-modal.tsx`.

2. `src/lib/linkedin-adapter.ts` — Parses a **LinkedIn CSV export** (Positions and Education CSVs, separately). This was an earlier approach. It is **no longer imported anywhere** in the codebase.

Keeping dead code creates confusion about what the application actually supports, pollutes the codebase, and misleads future developers and AI agents.

## Your Task

1. **Confirm** that `src/lib/linkedin-adapter.ts` is not imported anywhere:
   - Search for `linkedin-adapter` (without `-pdf-`) in all `.ts`, `.tsx` files.
   - It should return zero results outside the file itself.

2. **Delete** `src/lib/linkedin-adapter.ts`.

3. **Verify** the build still passes:
   - Run `npm run build` and confirm no TypeScript errors related to missing imports.

4. **Update `src/components/linkedin-import-modal.tsx`** (if applicable): check that no reference to `parseLinkedInPositions` or `parseLinkedInEducation` remains. If it does, this is a critical finding — do NOT delete the file; instead, document the situation and stop.

5. **Update the documentation**:
   - In `README.md`, the "Features" section mentions "LinkedIn PDF Import" — confirm this language is correct and update if needed.
   - If `docs/guides/` does not have a guide describing the LinkedIn import flow, create `docs/guides/LINKEDIN_IMPORT.md` documenting:
     - Only the **PDF adapter** is supported (not CSV).
     - How to obtain the LinkedIn PDF export.
     - The structure expected by `parseLinkedInPDF()`.
     - Known limitations (e.g., language-dependent section headers — the adapter handles English and Italian).

6. **Commit** using Conventional Commits:
   - `refactor(linkedin): remove dead CSV adapter, keep only PDF adapter`
   - `docs(guides): add LINKEDIN_IMPORT.md with PDF adapter documentation`

## Acceptance Criteria

- [ ] `src/lib/linkedin-adapter.ts` is deleted.
- [ ] `npm run build` exits cleanly.
- [ ] No remaining references to `parseLinkedInPositions` or `parseLinkedInEducation` in the codebase.
- [ ] `docs/guides/LINKEDIN_IMPORT.md` exists.
