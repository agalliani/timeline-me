'use client';

import Script from 'next/script';
import { siteConfig } from '@/lib/config';

/**
 * Google Analytics 4 loader component with GA4 Consent Mode v2.
 *
 * Loads the gtag.js script asynchronously and initializes GA4 with
 * `analytics_storage: 'denied'` by default. Consent is granted/denied
 * by the `CookieBanner` component via `gtag('consent', 'update', ...)`.
 *
 * Only renders in production and when a valid Measurement ID is configured.
 *
 * @see https://developers.google.com/analytics/devguides/collection/ga4
 * @see https://developers.google.com/tag-platform/security/guides/consent
 */
export function GoogleAnalytics() {
  const gaId = siteConfig.analytics.gaId;

  // Don't load analytics in development or without a valid Measurement ID
  if (process.env.NODE_ENV !== 'production' || !gaId || gaId === 'G-XXXXXXXXXX') {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            // GA4 Consent Mode v2: default to denied until user accepts
            gtag('consent', 'default', {
              analytics_storage: 'denied',
            });

            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
              send_page_view: true
            });
          `,
        }}
      />
    </>
  );
}
