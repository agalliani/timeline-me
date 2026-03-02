# Timeline Me

Visualize your professional journey in a stunning vertical timeline. Import from LinkedIn PDF or create manually. Privacy-focused, client-side only.

**Live Demo**: [https://agalliani.github.io/timeline-me](https://agalliani.github.io/timeline-me)

## Features

- 📄 **LinkedIn PDF Import** — Upload your LinkedIn profile PDF to auto-generate a timeline
- ✏️ **Manual Creation** — Add, edit, and delete timeline events
- 🎨 **Color Customization** — Category-based color settings
- 📐 **Vertical Timeline** — Professional chronological visualization
- 📸 **Export as PNG** — Download your timeline as an image
- 🔗 **Share & Embed** — URL-based sharing and iframe embedding
- 🌗 **Dark Mode** — System-aware theme support
- 🔒 **Privacy First** — All data stays client-side, no server needed

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router, static export)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Shadcn/UI](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- [Framer Motion](https://www.framer.com/motion/)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build & Deploy

The project is configured for static export and deployed to GitHub Pages:

```bash
npm run build   # Outputs to ./out
```

Deployment is automated via GitHub Actions on push to `master`.

## Analytics & SEO

- **Google Analytics 4** — Integrated via gtag.js with custom event tracking for user funnel analysis. See [docs/GROWTH_PLAN.md](docs/GROWTH_PLAN.md) for the full strategy.
- **SEO** — robots.txt, sitemap.xml, OpenGraph tags, Twitter Cards, and JSON-LD structured data are all configured.
- **Google Search Console** — Submit the sitemap at `https://agalliani.github.io/timeline-me/sitemap.xml`.

To configure GA4, update the Measurement ID in `src/lib/config.ts`.

## Documentation

## Documentation

- [Growth & Analytics Plan](docs/strategy/GROWTH_PLAN.md)
- [Analytics Implementation Guide](docs/guides/ANALYTICS_IMPLEMENTATION.md)

## Navigation

This repository is structured to help both human developers and AI agents navigate its complexities. Please refer to the `docs/` folder for deeper context:

- **[Architecture](docs/architecture/)**: Core technical documents, system design, and data models.
- **[Guides](docs/guides/)**: Operational guides, contribution rules, and deployment procedures.
- **[Strategy](docs/strategy/)**: High-level SEO, analytics, and growth strategies.
- **[Research & Audits](docs/research/)**: Point-in-time reviews and experimental data.
- **[AI Templates](docs/ai/)**: Custom prompts and templates for AI generation.

For AI Agents, specific directives are outlined in [`AI_AGENTS.md`](AI_AGENTS.md), along with IDE-specific rules in `.cursorrules` and `.windsurfrules`. Procedural workflows can be found in `.agent/workflows/`.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## License

MIT

