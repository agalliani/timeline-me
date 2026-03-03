# Timeline Me Development Guide

This guide covers the basic setup and development workflow for the **Timeline Me** project.

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/agalliani/timeline-me.git
   cd timeline-me
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Starts the Next.js development server.
- `npm run build` - Creates an optimized static export build (output to `out/` directory).
- `npm run start` - Starts the Next.js production server (not typically used for static exports).
- `npm run lint` - Runs ESLint using the built-in Next lint command (`next lint`).
- `npm test` - Runs all unit tests once using Vitest (exit 0 = all pass).
- `npm run test:watch` - Runs Vitest in watch mode (re-runs on file change).

## Testing

Tests are written with **Vitest** + `jsdom` and live in `src/lib/__tests__/`. Configuration is in `vitest.config.ts`.

### Test files

| File | What it tests |
|------|--------------|
| `src/lib/__tests__/timesheet.test.ts` | Date parsing, grid column/span calculations, `getYears()` |
| `src/lib/__tests__/url-utils.test.ts` | Encode/decode roundtrip, legacy format, malformed input |
| `src/lib/__tests__/bubble.test.ts` | `formatDateLabel()` — all date format variants |

### Running tests

```bash
npm test          # single run (used in CI)
npm run test:watch # watch mode for development
```

> Always run `npm test` before committing to catch regressions early.

## Notes on Dependencies

During the project cleanup, the following changes were made to dependencies:

- **`html2canvas`** was removed because the application uses `html-to-image` for generating timeline screenshots.
- **`next-themes`** is fully integrated — `ThemeProvider` wraps the app in `layout.tsx` and `ModeToggle` is in the control bar.
- Top-level UI package dependencies like `@hookform/resolvers` and `radix-ui` are retained because they are utilized by `react-hook-form` and Shadcn/UI components (`src/components/ui/`), respectively.
