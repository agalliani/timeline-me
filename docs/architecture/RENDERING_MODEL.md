# Rendering Model — Timeline Me

**Timeline Me** uses a CSS Grid-based rendering model to display timeline items.

## CSS Grid Layout

The horizontal timeline is represented as a grid where **each column is one month**.
The placement and duration of an event are controlled using native CSS grid properties:

- `gridColumnStart`: The starting month (1-based CSS Grid column index).
- `gridColumnSpan`: The duration of the event in months.

### Legacy Model (Removed)

Previously, the application calculated pixel widths and margins (`marginLeft`, `width`) for every bubble instance, based on a fixed `widthMonth` constant. This approach was brittle and didn't adapt well to modern responsive designs. All pixel-based layout logic and the `Bubble` wrapper class have been completely removed in favor of the CSS Grid approach.

---

## `Timesheet` Class (src/lib/timesheet.ts)

`Timesheet` is the core computation class that converts raw `TimelineItem[]` into `BubbleModel[]` ready for grid rendering.

### Constructor

```typescript
new Timesheet(min: number, max: number, data: TimelineItem[])
```

- `min`/`max`: initial year range (expanded automatically by `parse()`).
- `parse()`: iterates over all items, calls `parseDate()` for start and end, tracks the actual min/max year range.

### `getGridBubbles(): BubbleModel[]`

For each `ParsedTimelineItem`, computes `gridColumnStart` and `gridColumnSpan`:

#### Start Column

```
monthIndex  = date.getMonth()          // 0-based (January = 0)
yearDiff    = year - this.year.min
startColumn = (yearDiff * 12) + monthIndex + 1
```

#### Duration / Span

| Condition | Formula |
|-----------|---------|
| No end date, year-only start | `span = 12` (one full year) |
| No end date, month-precise start | `span = 1` (single month point) |
| End is year-only | `span = (12 − startMonth) + 12 × (fullYears − 1)` |
| End is month-precise | `span = (endYear × 12 + endMonth) − (startYear × 12 + startMonth) + 1` (inclusive) |

Minimum span is always clamped to `1`.

### `getYears(): number[]`

Returns years from `year.min` to `year.max + 2` (2-year buffer beyond the latest end date).

### `getTotalMonths(): number`

Returns `(year.max − year.min + 3) × 12` — total columns in the grid.

---

## `TimelineVertical` Component (src/components/timeline-vertical.tsx)

Renders the full timeline grid:

1. **Header row**: year labels rendered at the correct `gridColumnStart` positions (one label per year × 12 columns).
2. **Category rows**: one row per unique category, showing the category label in a sticky left column.
3. **Bubble rows**: for each `BubbleModel`, renders a colored pill at `gridColumnStart` spanning `gridColumnSpan` columns.

Color is resolved via a `colorMap` (category → hex), falling back to a predefined palette.

---

## Date Label Formatting

`formatDateLabel(start, end)` in `src/lib/bubble.ts` produces human-readable labels:

- Month-precise: `"01/2020-06/2022"`
- Year-only: `"2019-2022"`
- Open-ended: `"01/2020"` (no end)

`getMonth()` returns 0-based; `+1` converts back to 1-based for display.

See [`DATE_PIPELINE.md`](./DATE_PIPELINE.md) for the full date format pipeline.
