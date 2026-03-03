# Date Format Pipeline

This document describes how dates flow through the Timeline Me application, from raw input strings to CSS grid placement.

## Canonical Date String Formats

`TimelineItem.start` and `TimelineItem.end` accept two string formats:

| Format | Example | Meaning |
|--------|---------|---------|
| `"MM/YYYY"` | `"01/2020"` | January 2020 (month is **1-based**) |
| `"YYYY"` | `"2020"` | The full year 2020 (no specific month) |

A `null` / absent `end` means the item is ongoing (no end date).

## Input Adapters

Both adapters produce strings in the canonical formats above:

- **`src/lib/linkedin-pdf-adapter.ts` → `parseDate()`**  
  Parses dates extracted from LinkedIn PDF exports and returns `"MM/YYYY"` or `"YYYY"` strings (1-based month).
  This is the **only supported adapter** — the CSV-based adapter was removed as dead code (commit `c8e219d`).

## `Timesheet.parseDate()` — String → `DateObj`

Located in `src/lib/timesheet.ts`.

```typescript
interface DateObj {
  date: Date;      // JavaScript Date object
  hasMonth: boolean; // true when the original string included a month
}
```

Conversion rules:

| Input format | `hasMonth` | `date` value |
|---|---|---|
| `"YYYY"` | `false` | `new Date(year, 0, 1)` — January 1st of that year |
| `"MM/YYYY"` | `true` | `new Date(year, rawMonth - 1, 1)` — 1st of the given month (rawMonth is 1-based, JS months are 0-based) |

## `getGridBubbles()` — `DateObj` → CSS Grid Placement

Located in `src/lib/timesheet.ts`.

The timeline grid has one column per month, starting at the minimum year (`this.year.min`).

**Start column** (1-based CSS grid column):

```
startColumn = (year - minYear) * 12 + monthIndex + 1
```

where `monthIndex = date.getMonth()` (0-based, so January → 0).

**Duration in months** (`gridColumnSpan`):

- If no end date: `12` months for year-only items, `1` month for month-level items.
- If end date is year-only: `(12 - startMonth) + 12 * (fullYears - 1)`.
- If end date has a month: `(endYear * 12 + endMonth) - (startYear * 12 + startMonth) + 1` (inclusive).

## `Bubble.getDateLabel()` — `DateObj` → Display String

Located in `src/lib/bubble.ts`.

Formats the start/end dates as a human-readable label (e.g. `"01/2020-03/2022"`):

```typescript
(this.start.hasMonth ? formatMonth(this.start.date.getMonth() + 1) + '/' : '')
  + this.start.date.getFullYear()
```

`getMonth()` returns 0-based, so `+1` converts back to 1-based for display — consistent with the `"MM/YYYY"` canonical format.
