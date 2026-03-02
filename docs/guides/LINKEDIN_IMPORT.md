# LinkedIn Import Guide

## Overview

Timeline Me supports importing your professional history from a **LinkedIn Profile PDF export**. The CSV-based adapter was removed as dead code — only the PDF adapter is supported.

## How to Export Your LinkedIn Profile as PDF

1. Go to your [LinkedIn Profile](https://www.linkedin.com/in/me/).
2. Click the **More** button (near your profile picture).
3. Select **Save to PDF**.
4. A PDF file will be downloaded to your device.

## How to Import

1. Open [Timeline Me](https://agalliani.github.io/timeline-me).
2. Click **Import from LinkedIn**.
3. Upload the downloaded PDF file.
4. Review the parsed entries in the preview step.
5. Click **Import Data** to add the entries to your timeline.

## Technical Details

### Parser: `parseLinkedInPDF()`

Located in `src/lib/linkedin-pdf-adapter.ts`, this function:

1. Extracts raw text lines from the PDF using `pdfjs-dist`.
2. Identifies section headers (**Experience** / **Education**) to determine context.
3. Matches date-range patterns (e.g., `January 2020 - Present`, `2010 - 2014`) to detect individual entries.
4. Back-tracks from a date line to find the role/company (Experience) or degree/school (Education).
5. Captures description text following the date line.

### Expected PDF Structure

The parser expects the standard LinkedIn "Save to PDF" format:

**Experience section:**
```
Experience
  Company Name
  Role Title
  Date Range (e.g., "January 2020 - Present")
  Location (optional)
  Description (optional)
```

**Education section:**
```
Education
  School Name
  Degree Name
  Date Range (e.g., "2010 - 2014" or "September 2018 - June 2020")
```

### Supported Languages

The adapter handles section headers and month names in:

- **English** — `Experience`, `Education`, `Skills`, month names (`January`–`December`, `Jan`–`Dec`)
- **Italian** — `Esperienza`, `Formazione`, `Competenze`, month names (`Gennaio`–`Dicembre`, `Gen`, `Feb`, etc.)

### Known Limitations

- **Language support**: Only English and Italian section headers and month names are recognized. Profiles in other languages may not be parsed correctly.
- **PDF text extraction**: The parser relies on `pdfjs-dist` text extraction, which may not perfectly reconstruct the reading order for all PDF layouts.
- **Multi-role entries**: When a person has held multiple roles at the same company, the parser may not always correctly associate roles with the parent company.
- **Description extraction**: Description text is captured heuristically — it includes lines between the date line and the next detected entry. Some lines (e.g., location) may be skipped or included incorrectly.
- **"Present" detection**: Open-ended roles are detected via `Present` (English) and `Presente` (Italian) keywords only.
