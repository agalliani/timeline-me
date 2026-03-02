# Agent Task: Harden URL-Based Data Sharing (Base64 Encoding)

## Context

You are working on **Timeline Me**, a Next.js (App Router, static export) web application deployed to GitHub Pages at `https://agalliani.github.io/timeline-me`. The stack is: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Shadcn/UI.

Before starting, read:
- `AI_AGENTS.md` — commit convention and AI workflow rules.
- `src/lib/url-utils.ts` — the current URL encoding/decoding utilities.
- `src/components/timeline-app.tsx` — how `encodeTimelineData()` is called.
- `src/components/embed-modal.tsx` — how the embed URL is constructed.

## Problem Description

The app uses URL query parameters to share/embed timeline data. The encoding chain in `src/lib/url-utils.ts` is:

```typescript
// Encode
btoa(unescape(encodeURIComponent(JSON.stringify(payload))))

// Decode
decodeURIComponent(escape(atob(encoded)))
```

This is the old `unescape`/`escape` pattern, which is **deprecated** in modern JavaScript and may cause issues with certain Unicode characters. The modern approach uses `TextEncoder`/`TextDecoder` or `encodeURIComponent` directly on the Base64 output.

Additionally:

1. **URL length limits**: Large timelines (many events with long descriptions) may produce a Base64 string that exceeds browser or server URL limits (~2000 chars for IE compatibility, ~8000 chars in modern browsers). There is no guard or warning.

2. **No schema validation on decode**: `decodeTimelineData()` only checks `Array.isArray(parsed.d)` and `typeof parsed.c === 'object'`, but does not validate the shape of individual `TimelineItem` objects. A malformed URL could inject unexpected data.

3. **`?data=` param overrides localStorage colors**: In `handleLoadEffect`, if a URL `data` param is present, the color map embedded in it overrides localStorage colors only if the colorMap is non-empty. This logic may have edge cases when a shared URL includes an empty colorMap.

## Your Task

### 1. Replace the deprecated `unescape`/`escape` pattern

Update `encodeTimelineData` and `decodeTimelineData` to use the modern approach:

```typescript
// Encode
export const encodeTimelineData = (data: TimelineItem[], colorMap: Record<string, string>): string => {
    try {
        const payload = { d: data, c: colorMap };
        const json = JSON.stringify(payload);
        return btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) =>
            String.fromCharCode(parseInt(p1, 16))
        ));
    } catch (e) {
        console.error("Failed to encode timeline data:", e);
        return "";
    }
};

// Decode
export const decodeTimelineData = (encoded: string | null): { data: TimelineItem[]; colorMap: Record<string, string> } | null => {
    if (!encoded) return null;
    try {
        const json = decodeURIComponent(Array.from(atob(encoded), c =>
            '%' + c.charCodeAt(0).toString(16).padStart(2, '0')
        ).join(''));
        const parsed = JSON.parse(json);
        // ... rest of validation
    } catch (e) { ... }
};
```

Alternatively, use `TextEncoder`/`TextDecoder` if available.

### 2. Add URL length warning

In `handleShare()` in `timeline-app.tsx`, after constructing the URL:
- If `encoded.length > 6000`, show a `toast.warning("Share URL is very long and may not work in all environments. Consider exporting as image instead.")`.

### 3. Add basic schema validation on decode

In `decodeTimelineData()`, after parsing the JSON, validate each item in `parsed.d`:
- Each item must have `start: string`, `label: string`, `category: string`.
- Filter out malformed items silently (and log a warning).

### 4. Verify backward compatibility

The current decoder handles the legacy format (direct array). Keep this behavior.

After the encode change, test:
- Encode a sample timeline, copy the URL, clear data, then paste the URL to reload — data should load correctly.
- Also test that old-format URLs (direct JSON array, no `d`/`c` keys) still decode correctly.

### 5. Run `npm run dev` and test manually

- Share a timeline with at least 5 events.
- Open the shared URL in a new tab.
- Verify data is intact.

### 6. Run `npm run build`

Confirm clean build.

### 7. Update the documentation

- Update `docs/architecture/` with a document (or add a section to an existing doc) describing the URL serialization format: the `{ d, c }` payload structure, the encoding scheme, and the backwards-compatibility note.

### 8. Commit using Conventional Commits

- `fix(url-utils): replace deprecated unescape/escape with modern encoding`
- `feat(sharing): warn user when share URL exceeds safe length`
- `fix(url-utils): add schema validation on decode to reject malformed items`

## Acceptance Criteria

- [ ] `unescape`/`escape` removed from `url-utils.ts`.
- [ ] Share/load roundtrip works correctly (manually tested).
- [ ] URL length warning shown for large timelines.
- [ ] Malformed items filtered on decode.
- [ ] `npm run build` exits cleanly.
