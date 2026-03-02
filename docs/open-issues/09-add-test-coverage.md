# Agent Task: Add Test Coverage (Unit Tests for Core Business Logic)

## Context

You are working on **Timeline Me**, a Next.js (App Router, static export) web application deployed to GitHub Pages at `https://agalliani.github.io/timeline-me`. The stack is: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Shadcn/UI.

Before starting, read:
- `AI_AGENTS.md` — commit convention and AI workflow rules.
- `src/lib/timesheet.ts` — `Timesheet` class and date parsing.
- `src/lib/url-utils.ts` — encode/decode utilities.
- `src/lib/linkedin-pdf-adapter.ts` — PDF parsing logic.
- `src/lib/bubble.ts` — `Bubble` helper class.

## Problem Description

The project has **zero automated tests**. There is no test runner configured. The codebase contains complex business logic with known edge cases:

- Date parsing in `Timesheet.parseDate()` (1-based month input, 0-indexed JS Date).
- `getGridBubbles()` column/span calculation (year-only vs month-precise dates, no-end events).
- `encodeTimelineData()` / `decodeTimelineData()` roundtrip correctness.
- The PDF parsing heuristic in `parseLinkedInPDF()`.

Without tests, regressions are silently introduced (e.g., the off-by-one month bug documented in task 01).

## Your Task

### 1. Install and configure Vitest

Vitest integrates cleanly with Next.js + TypeScript without ejecting the build setup.

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

Add a `vitest.config.ts` at project root:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test/setup.ts'],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
```

Create `src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom';
```

Add to `package.json` scripts:
```json
"test": "vitest run",
"test:watch": "vitest"
```

### 2. Write unit tests for `Timesheet` date parsing

Create `src/lib/__tests__/timesheet.test.ts`:

Test cases must cover:
- `"01/2020"` → `DateObj` with `date = new Date(2020, 0, 1)` (January) and `hasMonth = true`.
- `"12/2023"` → December 2023.
- `"2019"` (year only) → `DateObj` with `date = new Date(2019, 0, 1)` and `hasMonth = false`.
- `getGridBubbles()` with a simple single-item timeline:
  - Item: `start = "01/2020"`, `end = "06/2020"` → `gridColumnStart = 1`, `gridColumnSpan = 6`.
- `getGridBubbles()` with an open-ended event (no `end`):
  - `gridColumnSpan` should be `1` (single month point).
- `getYears()` returns correct range.

### 3. Write unit tests for `url-utils.ts`

Create `src/lib/__tests__/url-utils.test.ts`:

Test cases:
- Roundtrip: `decodeTimelineData(encodeTimelineData(items, colorMap))` returns the original items and colorMap.
- Empty array roundtrip.
- Legacy format decode (direct array JSON without `d`/`c` keys).
- Malformed input (`decodeTimelineData("not-base64")`) returns `null`.
- Null input returns `null`.

### 4. Write unit tests for `bubble.ts`

Create `src/lib/__tests__/bubble.test.ts`:

- `getDateLabel()` for a range with months: `"01/2020-06/2020"`.
- `getDateLabel()` for a year-only range: `"2019-2022"`.
- `getDateLabel()` for an open end: `"01/2020"`.

### 5. (Optional, if time permits) Integration test for `parseLinkedInPDF()`

This requires mocking `pdfjs-dist`. Only attempt if you are confident in the mock setup.

### 6. Run `npm test` and ensure all tests pass

All tests must pass with no errors.

### 7. Update `package.json` and CI

In `.github/workflows/` (the deploy workflow), add a step before the build:
```yaml
- name: Run tests
  run: npm test
```
This ensures tests run on every push.

### 8. Update documentation

- Update `AI_AGENTS.md` to add: "**Run `npm test`** before committing to ensure no regressions."
- Update `docs/guides/DEVELOPMENT.md` (from task 04) to document the test setup and how to run tests.

### 9. Commit using Conventional Commits

- `test(setup): configure Vitest with jsdom for Next.js TypeScript project`
- `test(timesheet): add unit tests for date parsing and getGridBubbles()`
- `test(url-utils): add unit tests for encode/decode roundtrip`
- `test(bubble): add unit tests for getDateLabel()`
- `ci: add test step to GitHub Actions deploy workflow`

## Acceptance Criteria

- [ ] `vitest.config.ts` created.
- [ ] `npm test` runs and all tests pass.
- [ ] At least 10 distinct test cases across `timesheet`, `url-utils`, `bubble`.
- [ ] `.github/workflows/` deploy workflow runs tests before build.
- [ ] `AI_AGENTS.md` updated to mandate `npm test` before commits.
