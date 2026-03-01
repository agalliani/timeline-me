'use client';

import Script from 'next/script';
import { siteConfig } from '@/lib/config';

/**
 * Google Analytics 4 loader component.
 *
 * Loads the gtag.js script asynchronously and initializes GA4 tracking.
 * Only renders in production and when a valid Measurement ID is configured.
 *
 * @see https://developers.google.com/analytics/devguides/collection/ga4
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
