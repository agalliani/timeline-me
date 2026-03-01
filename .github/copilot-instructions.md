# Copilot Instructions for Timeline Me

## Project Overview

**Timeline Me** is a privacy-first, client-side web application that lets users visualize their professional journey as a vertical timeline. Users can import from a LinkedIn PDF export or create entries manually. All data stays in the browser — there is no backend.

**Live site**: https://agalliani.github.io/timeline-me

## Tech Stack

- **Framework**: Next.js 16 (App Router, `output: "export"` for static GitHub Pages deployment)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4 with `tailwind-merge` and `clsx`
- **UI Components**: Shadcn/UI + Radix UI primitives
- **Animation**: Framer Motion
- **Forms**: React Hook Form + Zod validation
- **Analytics**: Google Analytics 4 via gtag.js (Measurement ID in `src/lib/config.ts`)
- **Deployment**: GitHub Actions → GitHub Pages at `agalliani.github.io/timeline-me`

## Repository Structure

```
src/
  app/              # Next.js App Router pages and layouts
    embed/          # Embeddable iframe view
    layout.tsx      # Root layout with GA, metadata, dark-mode
    page.tsx        # Main timeline page
    robots.ts       # robots.txt route handler
    sitemap.ts      # sitemap.xml route handler (force-static)
  components/       # React components
  lib/              # Utilities and business logic
    analytics.ts    # GA4 custom event helpers
    config.ts       # siteConfig (name, URL, GA ID, keywords)
    linkedin-pdf-adapter.ts  # LinkedIn PDF → TimelineItem[]
    timesheet.ts    # Core timeline parsing/layout logic
    url-utils.ts    # URL-based state sharing helpers
  types/
    timeline.ts     # Core TypeScript interfaces (TimelineItem, BubbleModel, …)
```

## Key Conventions

### Commit Messages (Conventional Commits)
All commits must follow `<type>(<scope>): <subject>`:
- `feat`, `fix`, `refactor`, `style`, `test`, `docs`, `chore`
- Subject: imperative present tense, no capital, no trailing dot
- Examples: `feat(timeline): add zoom controls`, `fix(parsing): resolve leap year date error`

### Code Style
- Use TypeScript for all new files; avoid `any` unless unavoidable.
- Follow the existing `eslint-config-next` rules (`npm run lint`).
- Use Tailwind utility classes; avoid inline styles.
- Use Shadcn/UI components for new UI elements where possible.
- Keep components in `src/components/`; keep pure logic/utilities in `src/lib/`.

### Static Export Constraints
- This project uses `output: "export"` — **no** server-side rendering, API routes, or server actions.
- `basePath` is `/timeline-me` in production and `""` in development.
- Always use the `siteConfig.url` constant (from `src/lib/config.ts`) when building absolute URLs.

### Privacy / Data Handling
- All user data (timeline entries, imported PDF text) must remain **client-side only**.
- Do not send user data to any external service.

### Analytics
- Track meaningful user interactions using the helpers in `src/lib/analytics.ts`.
- Do not add new GA4 events without a corresponding entry in that file.

## Build & Development

```bash
npm install        # install dependencies
npm run dev        # start dev server at http://localhost:3000
npm run build      # static export to ./out
npm run lint       # run ESLint
```

## Testing

There is currently no automated test suite. Verify changes visually by running `npm run dev` and checking the UI at `http://localhost:3000`.
