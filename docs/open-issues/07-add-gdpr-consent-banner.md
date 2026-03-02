# Agent Task: Add GDPR Cookie Consent Banner

## Context

You are working on **Timeline Me**, a Next.js (App Router, static export) web application deployed to GitHub Pages at `https://agalliani.github.io/timeline-me`. The stack is: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Shadcn/UI.

Before starting, read:
- `AI_AGENTS.md` — commit convention and AI workflow rules.
- `src/components/google-analytics.tsx` — how GA4 is loaded.
- `src/lib/config.ts` — the site configuration.
- `docs/strategy/GROWTH_PLAN.md` section 6 — "Privacy Considerations".

## Problem Description

`docs/strategy/GROWTH_PLAN.md` section 6 already documents this gap:

> Cookie consent: Consider adding a consent banner for GDPR compliance (future)

The application:
1. Loads Google Analytics (`gtag.js`) unconditionally in production via `GoogleAnalytics` component.
2. GA4 sets cookies (`_ga`, `_ga_*`) which require user consent under GDPR/PECR for EU users.
3. There is no consent mechanism or Consent Mode v2 integration.

This is a legal requirement for EU users and should be addressed before the userbase grows.

## Your Task

### 1. Create a `CookieBanner` component

Create `src/components/cookie-banner.tsx`:
- A sticky bottom banner (using Tailwind + Shadcn/UI `Card` or raw Tailwind).
- Show the banner if `localStorage.getItem("cookie-consent")` is `null` (first visit).
- Provide two buttons: **Accept** and **Decline**.
- On **Accept**: save `"granted"` to `localStorage.getItem("cookie-consent")` and initialize GA4 tracking.
- On **Decline**: save `"denied"`.
- The banner should **not** appear again once a choice is made.

Visual requirements:
- Compact, non-intrusive (bottom of screen, fixed position).
- Clear text: "We use Google Analytics to understand how you use this app. No personal data is collected."
- Link to a simple privacy note (can be a tooltip or a `<details>` inline, not a separate page).

### 2. Integrate with `GoogleAnalytics` component

Modify `src/components/google-analytics.tsx` to implement **GA4 Consent Mode v2**:

```tsx
// Before gtag('config', ...) initialize with denied consent:
window.gtag('consent', 'default', {
    analytics_storage: 'denied',
});
```

Then, when the user accepts consent (from `CookieBanner`), call:
```tsx
window.gtag('consent', 'update', {
    analytics_storage: 'granted',
});
```

Use a global event or a React context to communicate consent status to the GA component.

### 3. On page load, restore consent

In `GoogleAnalytics` or a `useEffect` in `layout.tsx`, read `localStorage.getItem("cookie-consent")` and if it is `"granted"`, immediately call `gtag('consent', 'update', { analytics_storage: 'granted' })`.

### 4. Add `CookieBanner` to the layout

In `src/app/layout.tsx`, add `<CookieBanner />` inside the `<body>`, below `{children}`:

```tsx
<GoogleAnalytics />
{children}
<CookieBanner />
<Toaster />
```

### 5. Run `npm run dev` and test

- First visit (no localStorage): banner should appear.
- Accept: banner disappears, GA fires events.
- Decline: banner disappears, GA does not fire events.
- Reload: banner does not reappear.
- Clear localStorage: banner reappears.

### 6. Run `npm run build`

Confirm clean build.

### 7. Update the documentation

- Update `docs/strategy/GROWTH_PLAN.md` section 6: remove the "(future)" qualifier and describe the implemented consent mechanism.
- Update `docs/guides/ANALYTICS_IMPLEMENTATION.md` to document the consent flow.

### 8. Commit using Conventional Commits

- `feat(privacy): add GDPR cookie consent banner with GA4 Consent Mode v2 integration`
- `docs(strategy): update GROWTH_PLAN to reflect implemented cookie consent`

## Acceptance Criteria

- [ ] `CookieBanner` component created and renders on first visit.
- [ ] Accepting consent fires GA4 events; declining does not.
- [ ] `localStorage.getItem("cookie-consent")` persists the decision.
- [ ] No banner on repeat visits.
- [ ] `npm run build` exits cleanly.
- [ ] `GROWTH_PLAN.md` and `ANALYTICS_IMPLEMENTATION.md` updated.
