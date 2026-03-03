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

## Notes on Dependencies

During the project cleanup, the following changes were made to dependencies:

- **`html2canvas`** was removed because the application uses `html-to-image` for generating timeline screenshots.
- **`next-themes`** is installed but not currently integrated (there is no `ThemeProvider` in `layout.tsx`). This will be addressed when wiring up the dark mode functionality.
- Top-level UI package dependencies like `@hookform/resolvers` and `radix-ui` are retained because they are utilized by `react-hook-form` and Shadcn/UI components (`src/components/ui/`), respectively.
