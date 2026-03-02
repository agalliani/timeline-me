# Agent Task: Write Architecture Documentation

## Context

You are working on **Timeline Me**, a Next.js (App Router, static export) web application deployed to GitHub Pages at `https://agalliani.github.io/timeline-me`. The stack is: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Shadcn/UI.

Before starting, read **all existing source files** in:
- `src/lib/` — all utility modules.
- `src/components/` — all feature components.
- `src/app/` — page routes and layout.
- `src/types/timeline.ts` — data model types.

## Problem Description

The `docs/architecture/` directory is **empty**. For a project with this many interacting systems (PDF parsing, URL serialization, timeline rendering, analytics), there is no reference document explaining:

- The overall data model and how data flows through the app.
- The PDF parsing heuristic logic.
- The grid-based rendering model.
- How URL sharing serializes and passes data.

This is a significant barrier for new developers and AI agents, who must reverse-engineer everything from the source code.

## Your Task

Create the following documents in `docs/architecture/`:

---

### `docs/architecture/OVERVIEW.md`

A high-level architecture map covering:

1. **Tech Stack** — Next.js 16 (App Router, SSG), React 19, TypeScript, Tailwind CSS 4, Shadcn/UI, pdfjs-dist.
2. **Deployment** — GitHub Pages via static export (`next build` → `./out`), automated via GitHub Actions.
3. **Privacy Architecture** — Fully client-side. No backend. No server-side tracking. All data in `localStorage` or URL params.
4. **Component map** — A diagram (text-based or Mermaid) showing how components connect:
   - `layout.tsx` → `GoogleAnalytics`, `ThemeProvider`, `Toaster`
   - `page.tsx` → `TimelineApp`
   - `TimelineApp` → `TimelineVertical`, `TimelineModal`, `LinkedInImportModal`, `ColorSettingsModal`, `TemplateModal`, `EmbedModal`
   - `embed/page.tsx` → standalone embed viewer
5. **Data flow** — From user input (PDF upload, manual form, template load) → `TimelineItem[]` → `localStorage` + URL param → `TimelineVertical` rendering.

---

### `docs/architecture/DATA_MODEL.md`

Document the core types defined in `src/types/timeline.ts`:

- `TimelineItem` — the raw persisted/shared data structure.
- `DateObj` — the parsed internal date representation.
- `ParsedTimelineItem` — internal representation after date parsing.
- `BubbleModel` — the rendering model consumed by `TimelineVertical`.
- Explain the **date string format**: `"MM/YYYY"` (with zero-padded month) or `"YYYY"` (year-only).
- Explain `null` end date = ongoing/current role.

---

### `docs/architecture/PDF_PARSING.md`

Document the `parseLinkedInPDF()` heuristic in `src/lib/linkedin-pdf-adapter.ts`:

- How PDF text is extracted (pdfjs-dist, per-page, all text items flattened to lines).
- Section detection heuristic (regex matching "Experience", "Education", "Esperienza", "Formazione", etc.).
- Date line detection (regex matching "Month YYYY - Month YYYY" or "Month YYYY - Present").
- Backtracking to find Company and Role/School and Degree before the date line.
- Description extraction (lines after date line, stopping at next date or section header).
- Multi-language support: English and Italian month names and section headers.
- Known limitations: PDF structure is heuristic-based and may fail for non-standard LinkedIn PDF formats (e.g., languages other than English/Italian, or future LinkedIn PDF layout changes).

---

### `docs/architecture/RENDERING_MODEL.md`

Document the grid-based timeline rendering:

- `Timesheet` class — converts `TimelineItem[]` to `BubbleModel[]`.
- `getGridBubbles()` — calculates `gridColumnStart` and `gridColumnSpan` for CSS Grid placement.
- How `startColumn` is computed: `(yearDiff * 12) + monthIndex + 1`.
- How `durationMonths` is computed for different cases (no end, year-only end, month-precise end).
- The CSS Grid: `TimelineVertical` renders the header row (year labels) and then one row per `BubbleModel`, using `grid-column-start` and `grid-column-end` inline styles.

---

### Update `README.md`

In the Documentation section, add links to the new architecture docs:
```markdown
- **[Architecture Overview](docs/architecture/OVERVIEW.md)**: High-level system map.
- **[Data Model](docs/architecture/DATA_MODEL.md)**: Core TypeScript types and formats.
- **[PDF Parsing](docs/architecture/PDF_PARSING.md)**: LinkedIn PDF parsing heuristic.
- **[Rendering Model](docs/architecture/RENDERING_MODEL.md)**: Grid-based timeline rendering.
```

---

### 8. Commit using Conventional Commits

- `docs(architecture): add OVERVIEW, DATA_MODEL, PDF_PARSING, RENDERING_MODEL docs`
- `docs: update README with links to new architecture docs`

## Acceptance Criteria

- [ ] `docs/architecture/OVERVIEW.md` created with component map and data flow.
- [ ] `docs/architecture/DATA_MODEL.md` created with full type documentation.
- [ ] `docs/architecture/PDF_PARSING.md` created documenting the parsing heuristic.
- [ ] `docs/architecture/RENDERING_MODEL.md` created documenting grid placement logic.
- [ ] `README.md` updated with links to all new docs.
