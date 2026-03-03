# Timeline Me — Growth & Analytics Plan

## 1. Overview

This document outlines the analytics and SEO strategy for **Timeline Me**, a client-side web application hosted on GitHub Pages. The goal is to leverage Google Analytics 4 (GA4) and Google Search Console to understand user behavior, reconstruct user funnels, and prepare the infrastructure for future A/B testing.

## 2. Analytics Strategy (Google Analytics 4)

### 2.1 Implementation Approach

- **GA4 via gtag.js**: We use the standard `gtag.js` snippet loaded asynchronously in the Next.js root layout. This is the recommended approach by Google for modern web apps.
- **Consent-aware**: The implementation respects user privacy. No cookies are set until the user interacts with the page (GA4 default behavior with consent mode).
- **Environment-aware**: Analytics only loads in production (`NODE_ENV === 'production'`), preventing polluted data during development.

### 2.2 Measurement ID Configuration

The GA4 Measurement ID (format: `G-XXXXXXXXXX`) is stored in `src/lib/config.ts` under `siteConfig.analytics.gaId`. Replace the placeholder with your actual GA4 property ID.

### 2.3 Custom Events for Funnel Tracking

We track the following custom events to reconstruct the user journey:

| Event Name | Trigger | Parameters | Funnel Stage |
|---|---|---|---|
| `page_view` | Auto (gtag default) | `page_path`, `page_title` | Awareness |
| `timeline_import_linkedin` | User imports LinkedIn PDF | `event_count` | Activation |
| `timeline_load_demo` | User loads demo data | — | Activation |
| `timeline_load_template` | User loads a template | `template_name` | Activation |
| `timeline_add_event` | User adds a timeline event | — | Engagement |
| `timeline_edit_event` | User edits a timeline event | — | Engagement |
| `timeline_delete_event` | User deletes a timeline event | — | Engagement |
| `timeline_share` | User copies share URL | — | Referral |
| `timeline_embed` | User opens embed modal | — | Referral |
| `timeline_export_image` | User downloads timeline image | — | Retention |
| `timeline_clear_all` | User clears all data | — | Churn signal |
| `timeline_color_settings` | User customizes colors | — | Engagement |

### 2.4 Google Analytics 4 Best Practices Applied

1. **Enhanced Measurement**: GA4 automatically tracks scrolls, outbound clicks, site search, video engagement, and file downloads when enabled in the GA4 property settings.
2. **Data Streams**: Configure a single Web data stream for `agalliani.github.io/timeline-me`.
3. **Debug Mode**: Use `gtag('config', ..., { debug_mode: true })` during development.
4. **User Properties**: Set custom dimensions for returning vs. new users based on localStorage presence.
5. **Conversion Events**: Mark `timeline_import_linkedin`, `timeline_share`, and `timeline_export_image` as conversion events in GA4 admin.

## 3. SEO Strategy

### 3.1 Current Implementation

- ✅ `robots.txt` via Next.js `robots.ts` route handler (statically generated)
- ✅ `sitemap.xml` via Next.js `sitemap.ts` route handler (statically generated)
- ✅ OpenGraph meta tags (title, description, image)
- ✅ Twitter Card meta tags
- ✅ Canonical URL
- ✅ JSON-LD structured data (SoftwareApplication schema)
- ✅ Semantic HTML (`<main>`, `<section>`, `<footer>`, `<h1>`)
- ✅ `.nojekyll` file for GitHub Pages

### 3.2 Sitemap Coverage

The sitemap includes:
- `/` — Main application page (priority: 1.0, weekly)
- `/embed` — Embed viewer page (priority: 0.5, monthly)

### 3.3 Google Search Console Integration

To set up Google Search Console:
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property: `https://agalliani.github.io/timeline-me`
3. Verify via HTML meta tag or DNS (if custom domain)
4. Submit sitemap: `https://agalliani.github.io/timeline-me/sitemap.xml`
5. Monitor indexing status and search performance

### 3.4 robots.txt Configuration

```
User-Agent: *
Allow: /
Disallow: /private/
Sitemap: https://agalliani.github.io/timeline-me/sitemap.xml
```

## 4. Future: A/B Testing Readiness

### 4.1 Architecture

The analytics module (`src/lib/analytics.ts`) is designed to support future A/B testing:

- **Data Layer**: The `gtag` data layer is initialized and accessible globally.
- **Custom Dimensions**: User segments can be sent as custom dimensions.
- **Google Optimize successor**: Google now recommends using GA4's built-in A/B testing features or third-party tools integrated via the data layer.

### 4.2 Recommended A/B Testing Approach

1. **GA4 Audiences**: Create audiences based on user behavior (e.g., "imported LinkedIn" vs. "used demo data").
2. **Firebase Remote Config**: For dynamic feature flags and experiments (client-side).
3. **URL-based experiments**: Since the app is client-side, query parameter-based experiments are simplest.
4. **Custom experiment tracking**: Use `gtag('event', 'experiment_impression', { experiment_id, variant_id })` to log experiment data.

### 4.3 Implementation Steps (Future)

1. Define experiment variants in config
2. Assign users to variants (hash-based or random, stored in localStorage)
3. Track variant assignment via GA4 custom event
4. Analyze results in GA4 Explore reports

## 5. Key Metrics Dashboard (GA4)

### Core KPIs
- **Users**: Daily/Weekly/Monthly active users
- **Engagement Rate**: Sessions with engagement (>10s or conversion)
- **Feature Adoption**: % of users who import LinkedIn vs. manual create
- **Virality**: Share and embed event rates
- **Retention**: Returning user rate (7-day, 30-day)

### Funnel Reports
Configure in GA4 Explore:
1. Landing → Import/Demo → Add Event → Share/Export
2. Landing → Template → Customize → Share/Export

## 6. Privacy Considerations

- No PII is collected
- Data stays client-side (no server-side tracking)
- GA4 data retention: Set to 14 months (configurable)
- IP anonymization: Enabled by default in GA4
- **Cookie consent**: A GDPR-compliant consent banner (`src/components/cookie-banner.tsx`) is displayed on first visit:
  - Users can **Accept** or **Decline** analytics tracking.
  - The choice is persisted in `localStorage` under the key `cookie-consent`.
  - GA4 is configured with **Consent Mode v2** (`analytics_storage: 'denied'` by default); consent is upgraded to `'granted'` only when the user accepts.
  - The banner does not reappear once a choice is made. Users can revoke consent by clearing `localStorage`.
