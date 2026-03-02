# Agent Task: Fix Date Parsing Off-by-One Bug in `timesheet.ts`

## Context

You are working on **Timeline Me**, a Next.js (App Router, static export) web application deployed to GitHub Pages at `https://agalliani.github.io/timeline-me`. The stack is: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Shadcn/UI.

Before starting, read:
- `AI_AGENTS.md` — commit convention and AI workflow rules.
- `docs/architecture/` — any available architecture documents.

## Problem Description

In `src/lib/timesheet.ts`, the `parseDate` method has a known off-by-one bug in the month-date construction. Lines 72–76 read:

```typescript
const rawMonth = parseInt(splittedDateInfo[0], 10);
const year = parseInt(splittedDateInfo[1], 10);
dateObj.date = new Date(year, rawMonth, -1, 1);
dateObj.hasMonth = true;
```

The input format is `"MM/YYYY"` (e.g., `"01/2020"` for January 2020). The JavaScript `Date` constructor uses a **0-indexed** month (0 = January, 11 = December). Passing `rawMonth = 1` for January, combined with day `-1`, produces `December 30, 2019` instead of `January 2020` — which is clearly wrong.

The correct construction should be:
```typescript
dateObj.date = new Date(year, rawMonth - 1, 1);  // rawMonth is 1-based
```

There are **two date parsers** in the codebase that produce this `"MM/YYYY"` format:
1. `src/lib/linkedin-adapter.ts` → `parseLinkedInDate()` — returns `"MM/YYYY"` strings (1-based month).
2. `src/lib/linkedin-pdf-adapter.ts` → `parseDate()` — returns `"MM/YYYY"` strings (1-based month).

Both assume 1-based months. The `Timesheet.parseDate()` must be consistent with this convention.

## Your Task

1. **Fix the bug** in `src/lib/timesheet.ts`, method `parseDate`:
   - Change `new Date(year, rawMonth, -1, 1)` → `new Date(year, rawMonth - 1, 1)`.
   - Remove the misleading legacy comments (lines 53–70) that describe old quirky behaviour.
   - The fixed logic should be clean and self-explanatory.

2. **Verify the fix is consistent** with `Bubble.getDateLabel()` in `src/lib/bubble.ts`:
   - `getDateLabel()` calls `this.start.date.getMonth() + 1` then formats it. This is correct after the fix.
   - `getGridBubbles()` in `timesheet.ts` calls `cur.start.date.getMonth()` for `startColumn` and for span calculation — verify these are still correct after fixing the `Date` constructor.

3. **Run `npm run dev`** and visually verify a timeline loaded from demo data (`DEMO_DATA`) renders with items placed at the correct dates. Also check that a LinkedIn PDF import populates the timeline correctly.

4. **Run `npm run build`** and confirm there are no TypeScript or build errors.

5. **Update the documentation**:
   - If `docs/architecture/` has no document describing the date format pipeline (from input string `"MM/YYYY"` → `DateObj` → grid column), create `docs/architecture/DATE_PIPELINE.md` documenting:
     - The canonical date string format used in `TimelineItem.start` / `TimelineItem.end` (`"MM/YYYY"` or `"YYYY"`).
     - How `Timesheet.parseDate()` converts these to `DateObj`.
     - How `getGridBubbles()` uses `DateObj` for CSS grid placement.

6. **Commit** using Conventional Commits:
   - `fix(timesheet): correct month off-by-one in parseDate (raw month is 1-based)`
   - `docs(architecture): add DATE_PIPELINE.md documenting date format pipeline`

## Acceptance Criteria

- [ ] `new Date(year, rawMonth - 1, 1)` is the expression used.
- [ ] Legacy misleading comments removed.
- [ ] `Bubble.getDateLabel()` still returns correct labels (verified visually).
- [ ] `npm run build` exits cleanly.
- [ ] `docs/architecture/DATE_PIPELINE.md` exists and documents the full date pipeline.
