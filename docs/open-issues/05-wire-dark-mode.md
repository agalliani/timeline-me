# Agent Task: Wire Up Dark Mode with `next-themes`

## Context

You are working on **Timeline Me**, a Next.js (App Router, static export) web application deployed to GitHub Pages at `https://agalliani.github.io/timeline-me`. The stack is: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Shadcn/UI.

Before starting, read:
- `AI_AGENTS.md` — commit convention and AI workflow rules.
- `src/app/layout.tsx` — the root layout.
- `src/app/globals.css` — to check CSS custom properties for dark mode.

## Problem Description

`next-themes` (`^0.4.6`) is listed in `package.json` as a dependency, but it is **not integrated** in the app. The `README.md` claims `🌗 Dark Mode — System-aware theme support` as a feature, but:

1. `ThemeProvider` from `next-themes` is **not wrapped** around the app in `src/app/layout.tsx`.
2. There is no theme toggle button in the UI (`timeline-app.tsx`).
3. `globals.css` may define CSS variables for both light and dark themes (check `@media (prefers-color-scheme: dark)` or `.dark` class rules), but without `ThemeProvider`, switching themes requires manual class toggling.

This is a gap between documented features and actual implementation.

## Your Task

### 1. Inspect the current dark mode CSS

Open `src/app/globals.css` and check:
- Are there `.dark { ... }` class-based CSS variable overrides?
- Or is there only `@media (prefers-color-scheme: dark)` (system-only)?

Tailwind CSS 4 uses `darkMode: 'class'` by default in Shadcn setups, which requires the `.dark` class on `<html>`.

### 2. Wire up `ThemeProvider`

In `src/app/layout.tsx`, wrap `{children}` with `ThemeProvider`:

```tsx
import { ThemeProvider } from "next-themes";

// Inside RootLayout body:
<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
  <GoogleAnalytics />
  {children}
  <Toaster />
</ThemeProvider>
```

Make sure `ThemeProvider` is not server-rendered statically in a way that causes hydration mismatches (it is designed for client use; `"use client"` is handled internally by `next-themes`).

### 3. Add a theme toggle button

In `src/components/timeline-app.tsx`:
- Import `useTheme` from `next-themes`.
- Add a `MoonStar` / `Sun` icon toggle button (from `lucide-react`) in the top-right of the action bar (both desktop and mobile views).
- On click, toggle between `"light"` and `"dark"`.

### 4. Ensure Tailwind CSS 4 dark mode config

In `tailwind.config.ts` (or wherever Tailwind is configured), ensure:
```js
darkMode: 'class'
```
is set. In Tailwind CSS v4, dark mode class is configured differently — check the Tailwind v4 docs if needed.

### 5. Test dark mode

- Run `npm run dev`.
- Toggle dark mode via the button and verify:
  - Background, text, borders, card surfaces switch correctly.
  - The timeline items display correctly in both modes.
- Test on mobile viewport.

### 6. Run `npm run build`

Confirm no TypeScript or build errors.

### 7. Update the documentation

- Update `README.md` to clarify that dark mode is now fully functional (both system-aware and manually toggleable).
- Add a note in `docs/guides/DEVELOPMENT.md` (created in task 04) about dark mode configuration.

### 8. Commit using Conventional Commits

- `feat(ui): wire up next-themes ThemeProvider for system-aware dark mode`
- `feat(ui): add dark/light mode toggle button in action bar`

## Acceptance Criteria

- [x] `ThemeProvider` wraps the app in `layout.tsx`.
- [x] A theme toggle button is visible in the action bar.
- [x] Dark mode visually works (background, text, cards switch colors).
- [x] `npm run build` exits cleanly.
- [x] `README.md` dark mode feature is confirmed accurate.
