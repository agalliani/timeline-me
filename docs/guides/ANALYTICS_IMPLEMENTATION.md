# Analytics Implementation Guide

## Technical Architecture

### File Structure

```
src/
├── lib/
│   ├── analytics.ts        # Analytics utility module (event tracking, gtag wrapper)
│   └── config.ts           # Site config including GA4 Measurement ID
├── components/
│   ├── google-analytics.tsx # GA4 script loader + Consent Mode v2 initialization
│   └── cookie-banner.tsx    # GDPR consent banner component
└── app/
    ├── layout.tsx           # Root layout (includes GoogleAnalytics, CookieBanner)
    ├── robots.ts            # robots.txt generator
    └── sitemap.ts           # sitemap.xml generator
```

### Google Analytics Component

The `GoogleAnalytics` component (`src/components/google-analytics.tsx`):
- Loads `gtag.js` asynchronously via Next.js `<Script>` with `afterInteractive` strategy
- Only renders when a valid Measurement ID is configured
- Only loads in production environment
- Initializes the data layer and sends the initial `config` command

### Analytics Module

The `analytics.ts` module (`src/lib/analytics.ts`) provides:
- `trackEvent(action, params)` — Send custom events to GA4
- Pre-defined event functions for each user action (e.g., `trackLinkedInImport()`, `trackShare()`)
- Type-safe event parameters

### How Events Are Tracked

Events are tracked by calling the utility functions from component event handlers:

```typescript
import { trackEvent } from '@/lib/analytics';

// In component
const handleShare = () => {
  // ... existing logic
  trackEvent('timeline_share');
};
```

## Setup Instructions

### 1. Create GA4 Property

1. Go to [Google Analytics](https://analytics.google.com)
2. Create a new GA4 property
3. Set up a Web data stream for `https://agalliani.github.io/timeline-me`
4. Copy the Measurement ID (format: `G-XXXXXXXXXX`)

### 2. Configure Measurement ID

Update `src/lib/config.ts`:

```typescript
analytics: {
  gaId: 'G-XXXXXXXXXX', // Replace with your actual Measurement ID
}
```

### 3. Mark Conversion Events

In GA4 Admin → Events, mark these as conversions:
- `timeline_import_linkedin`
- `timeline_share`
- `timeline_export_image`
- `timeline_embed`

### 4. Enable Enhanced Measurement

In GA4 Admin → Data Streams → Your stream → Enhanced Measurement:
- ✅ Page views
- ✅ Scrolls
- ✅ Outbound clicks
- ✅ Site search
- ✅ File downloads

### 5. Submit Sitemap to Google Search Console

1. Verify site ownership in [Google Search Console](https://search.google.com/search-console)
2. Submit sitemap URL: `https://agalliani.github.io/timeline-me/sitemap.xml`

## Testing

### Local Development

Analytics does NOT load in development mode to prevent polluted data.
To test tracking locally, temporarily set `debug_mode: true` in the gtag config.

### GA4 DebugView

1. Install [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna) Chrome extension
2. Enable it and visit the production site
3. Go to GA4 → Admin → DebugView to see real-time events

### Verify robots.txt and sitemap.xml

After deployment, verify:
- `https://agalliani.github.io/timeline-me/robots.txt`
- `https://agalliani.github.io/timeline-me/sitemap.xml`
