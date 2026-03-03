# Data Model — Timeline Me

This document describes the core TypeScript types defined in `src/types/timeline.ts` and how they relate to each other.

## Type Hierarchy

```
TimelineItem[]          (persisted / shared — string dates)
       │
       │  Timesheet.parse()
       ▼
ParsedTimelineItem[]    (internal — Date objects)
       │
       │  Timesheet.getGridBubbles()
       ▼
BubbleModel[]           (rendering — CSS Grid coordinates)
```

---

## `TimelineItem`

The **raw, serializable** data structure. This is what gets stored in `localStorage` and encoded in share URLs.

```typescript
interface TimelineItem {
    start: string;         // "MM/YYYY" or "YYYY"
    end: string | null;    // "MM/YYYY" or "YYYY" or null (ongoing)
    label: string;         // Display name (e.g. "Software Engineer at Acme")
    category: string;      // User-defined category (e.g. "Work", "Education")
    description?: string;  // Optional free-text description
}
```

### Date string formats

| Format | Example | Meaning |
|--------|---------|---------|
| `"MM/YYYY"` | `"01/2020"` | January 2020 (month is **1-based**, zero-padded) |
| `"YYYY"` | `"2020"` | Full year 2020, no specific month |

A `null` `end` value means the item is **ongoing** (no end date).

---

## `DateObj`

**Internal** parsed date representation produced by `Timesheet.parseDate()`.

```typescript
interface DateObj {
    date: Date;        // JavaScript Date object
    hasMonth: boolean; // true when the original string included a month component
}
```

- For `"YYYY"` input: `date = new Date(year, 0, 1)`, `hasMonth = false`
- For `"MM/YYYY"` input: `date = new Date(year, rawMonth - 1, 1)`, `hasMonth = true`

> **Note**: The JS `Date` constructor uses 0-based months (0 = January), but the canonical string format uses 1-based months, hence `rawMonth - 1`.

---

## `ParsedTimelineItem`

**Internal** representation after date parsing. Used inside `Timesheet` but not directly exposed to the UI.

```typescript
interface ParsedTimelineItem {
    start: DateObj;
    end: DateObj | null;
    label: string;
    type: string;          // Maps from TimelineItem.category
    description?: string;
}
```

---

## `BubbleModel`

The **rendering model** consumed by `TimelineVertical`. Each `BubbleModel` maps to one row in the CSS Grid.

```typescript
interface BubbleModel {
    type: string;             // Category (used for CSS class and color lookup)
    class: string;            // CSS class string (e.g. "bubble bubble-Work")
    duration: string;         // Human-readable duration in months (approximate)
    dateLabel: string;        // Formatted date label (e.g. "01/2020-06/2022")
    label: string;            // Event title
    description?: string;

    // Grid Support
    gridColumnStart?: number; // 1-based CSS Grid column start
    gridColumnSpan?: number;  // Number of columns (months) the bubble spans
}
```

### Grid coordinates

- **`gridColumnStart`**: `(yearDiff * 12) + monthIndex + 1` where `yearDiff = year - minYear` and `monthIndex = date.getMonth()` (0-based).
- **`gridColumnSpan`**: duration in months, calculated from the difference between start and end `DateObj`s. Minimum value is 1.

See [`DATE_PIPELINE.md`](./DATE_PIPELINE.md) and [`RENDERING_MODEL.md`](./RENDERING_MODEL.md) for detailed calculation rules.

---

## URL Serialization

When sharing a timeline via URL, the payload is:

```typescript
{ d: TimelineItem[], c: Record<string, string> }
```

where `d` is the timeline data array and `c` is the color map (category → hex color).

This object is JSON-serialized and encoded to a URL-safe Base64 string by `src/lib/url-utils.ts`.

A legacy format (direct JSON array without the `{ d, c }` envelope) is also supported for backward compatibility.
