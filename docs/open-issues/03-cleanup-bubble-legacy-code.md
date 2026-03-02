# Agent Task: Clean Up Deprecated `getBubbles()` and Legacy Fields in `BubbleModel`

## Context

You are working on **Timeline Me**, a Next.js (App Router, static export) web application deployed to GitHub Pages at `https://agalliani.github.io/timeline-me`. The stack is: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Shadcn/UI.

Before starting, read:
- `AI_AGENTS.md` — commit convention and AI workflow rules.
- `src/lib/timesheet.ts` — the Timesheet class.
- `src/lib/bubble.ts` — the Bubble helper class.
- `src/components/timeline-vertical.tsx` — the rendering component that consumes `BubbleModel`.
- `src/types/timeline.ts` — the shared type definitions.

## Problem Description

### Issue 1: Deprecated `getBubbles()` wrapper

In `src/lib/timesheet.ts`, the `getBubbles()` method (lines 90–98) is a deprecated wrapper:

```typescript
getBubbles(widthMonth?: number): BubbleModel[] {
    // ... legacy implementation wrapper or deprecation notice?
    return this.getGridBubbles().map(b => ({
        ...b,
        marginLeft: 0, // No longer used in grid
        width: 0       // No longer used in grid
    }));
}
```

The active method is `getGridBubbles()`. The `getBubbles()` wrapper is confusing because it returns all data with `marginLeft: 0` and `width: 0` — these were legacy pixel-based layout fields. If `getBubbles()` is not called anywhere outside the class, it should be removed.

### Issue 2: Legacy fields `marginLeft` and `width` in `BubbleModel`

In `src/types/timeline.ts`, `BubbleModel` defines:

```typescript
export interface BubbleModel {
    marginLeft: number; // Legacy
    width: number;      // Legacy
    ...
}
```

These fields are explicitly marked as `// Legacy`. The grid-based layout only uses `gridColumnStart` and `gridColumnSpan`. If the legacy fields are not consumed anywhere in `timeline-vertical.tsx` or any other rendering component, they should be removed from the interface.

### Issue 3: Instantiation of `Bubble` just for one helper method

In `getGridBubbles()` (line 151), a `Bubble` object is instantiated solely to call `bubble.getDateLabel()`:

```typescript
const bubble = new Bubble(0, this.year.min, cur.start, cur.end); // Just for helpers if needed
```

The `getDateLabel()` logic in `Bubble` is simple and could be inlined or extracted as a standalone free function, eliminating the unnecessary class instantiation.

## Your Task

1. **Search for all usages** of `getBubbles()` across the codebase. If it is not called anywhere, remove it from `Timesheet`.

2. **Search for usages** of `BubbleModel.marginLeft` and `BubbleModel.width` in all `.tsx`/`.ts` files. If unused:
   - Remove them from the `BubbleModel` interface in `src/types/timeline.ts`.
   - Remove the `marginLeft: 0` and `width: 0` assignments from `getGridBubbles()`.

3. **Refactor the `Bubble` instantiation** in `getGridBubbles()`:
   - Extract `Bubble.getDateLabel()` as a standalone pure function `formatDateLabel(start: DateObj, end: DateObj | null): string` in `src/lib/bubble.ts` or in a new `src/lib/date-utils.ts`.
   - Replace the `new Bubble(...)` call with the standalone function call.
   - If `Bubble.getStartOffset()` and `Bubble.getWidth()` are also unused (they depend on `widthMonth` which is a legacy pixel-width concept), consider removing the `Bubble` class entirely or marking it `@deprecated`.

4. **Run `npm run build`** and fix any TypeScript errors.

5. **Visually verify** by running `npm run dev` and loading the demo timeline — confirm the timeline displays correctly.

6. **Update the documentation**:
   - Update `docs/architecture/` with a note (or create `docs/architecture/RENDERING_MODEL.md`) describing the current grid-based rendering model and clarifying that the legacy pixel-width model has been removed.

7. **Commit** using Conventional Commits:
   - `refactor(timesheet): remove deprecated getBubbles() and legacy pixel-width fields`
   - `refactor(bubble): extract getDateLabel to standalone function, remove dead Bubble instantiation`

## Acceptance Criteria

- [ ] `getBubbles()` removed (or kept only if proven to be called externally).
- [ ] `BubbleModel.marginLeft` and `BubbleModel.width` removed from the interface and all assignments.
- [ ] No unnecessary `new Bubble(...)` instantiation in `getGridBubbles()`.
- [ ] `npm run build` exits cleanly.
- [ ] `docs/architecture/RENDERING_MODEL.md` created or updated.
