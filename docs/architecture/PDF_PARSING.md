# LinkedIn PDF Parsing — Heuristic Documentation

This document describes how `parseLinkedInPDF()` in `src/lib/linkedin-pdf-adapter.ts` extracts timeline data from a LinkedIn Profile PDF export.

## Overview

LinkedIn does not provide a structured data API for profile exports. The PDF export ("Save to PDF") contains the profile in a formatted layout. `pdfjs-dist` extracts raw text items per page; the parser then applies heuristics to reconstruct structured `TimelineItem` records.

## Step 1: Text Extraction

```typescript
extractTextFromPDF(file: File): Promise<string[]>
```

1. Imports `pdfjs-dist` dynamically (avoids SSR issues with canvas/DOMMatrix).
2. Sets `GlobalWorkerOptions.workerSrc` to `/pdf.worker.min.mjs` (served from `public/`).
3. Iterates over all pages and flattens `textContent.items` into a single `string[]` array.
4. Empty strings are filtered out.

**Result**: a flat array of text lines in document reading order.

## Step 2: Section Detection

The parser maintains a `section` state variable:

```
'NONE' | 'EXPERIENCE' | 'EDUCATION'
```

Lines that match section header patterns switch the active section:

| Pattern | Language | Sets section |
|---------|----------|------|
| `/^E[xs]p?erien[cz](e\|a)$/i` | EN/IT (Experience/Esperienza) | `EXPERIENCE` |
| `/^Ed?ucation$/i` | EN (Education) | `EDUCATION` |
| `/^Formazione$/i` | IT | `EDUCATION` |
| `/^Competenze\|Skills$/i` | EN/IT | `NONE` (end of useful data) |
| `/^Languages\|Lingue$/i` | EN/IT | `NONE` |

## Step 3: Date Line Detection

### Experience date regex

Matches patterns like `"January 2020 - Present"` or `"dicembre 2025 - June 2027"`:

```
^(MonthName) (YYYY) [-–—] (Present|Presente|MonthName YYYY)
```

Month names supported (case-insensitive):
- **English**: January, February, …, December + abbreviated forms (Jan, Feb, …)
- **Italian**: Gennaio, Febbraio, …, Dicembre + abbreviated forms (Gen, Febbr, Mag, Giu, Lug, Ago, Set, Ott, Dic)

### Education date regex

Matches year-only ranges like `"2010 - 2014"` or `"(2010 - 2014)"`:

```
^[(· ]*(\d{4}) [-–—] (\d{4}|Present|Presente)[) ]*$
```

For PhD-style education entries with full month ranges, the same `dateRangeRegex` used for Experience is also checked first.

## Step 4: Date Parsing

`parseDate(dateStr)` converts a raw date string to the canonical `"MM/YYYY"` or `"YYYY"` format:

- `"Month YYYY"` → `"MM/YYYY"` via the month name lookup table.
- `"YYYY"` → `"YYYY"` (year only).
- `"Present"` / `"Presente"` → `null` (open-ended entry).

## Step 5: Backtracking for Company/Role and School/Degree

Once a date line is found, the parser backtracks through previous lines to find the entity label:

**Experience**:
- Skip lines matching `/(\d+|un|uno)\s(ann[oi]|mes[ei]|years?|months?)/i` (duration strings like "3 anni 1 mese").
- The first non-duration line is the **role**.
- The next non-duration, non-empty line above that is the **company**.
- Label is built as: `"${role} at ${company}"`.

**Education**:
- Skip empty lines.
- First line above is the **degree**.
- Next non-empty line above is the **school**.
- Label is built as: `"${degree} at ${school}"`.

## Step 6: Description Extraction

Lines **after** the date line (index `i + 1` onwards) are captured until:
- Another date line is matched.
- A section header is matched.
- End of file.

The first line after the date (which is often a location like "Milan, Italy") is skipped if it is short and alphabetic-only. Bullet characters (`·`, `•`, `-`) are stripped from the start of collected lines. Lines are joined with `\n`.

## Known Limitations

| Limitation | Details |
|---|---|
| Language support | Only English and Italian section headers and month names are recognized. Other LinkedIn UI languages will fail silently. |
| PDF text order | `pdfjs-dist` extraction may not always reconstruct reading order correctly for all PDF layouts (e.g., multi-column or text with unusual font embedding). |
| Multi-role at same company | LinkedIn groups multiple roles under one company. The parser may misattribute the company for inner roles. |
| Description boundaries | The description extraction is heuristic — location lines and occasional metadata may be included or excluded incorrectly. |
| LinkedIn format changes | The parser depends on LinkedIn's "Save to PDF" layout. Future LinkedIn changes could break heuristics. |

## Output

For each detected entry, a `TimelineItem` is pushed:

```typescript
{
    start: "MM/YYYY" | "YYYY",
    end: "MM/YYYY" | "YYYY" | null,
    label: "Role at Company" | "Degree at School",
    category: "Work" | "Education",
    description: "...",
}
```
