/**
 * Google Analytics 4 event tracking utilities.
 *
 * All custom events follow GA4 recommended naming conventions:
 * - snake_case names
 * - Prefixed with "timeline_" for app-specific events
 *
 * @see https://developers.google.com/analytics/devguides/collection/ga4/reference/events
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Send a custom event to Google Analytics 4.
 * Safely no-ops if gtag is not loaded (e.g., in development or with ad blockers).
 */
export function trackEvent(action: string, params?: Record<string, string | number | boolean>): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, params);
  }
}

// ── Pre-defined event helpers for funnel tracking ──

/** User imports LinkedIn PDF data */
export function trackLinkedInImport(eventCount: number): void {
  trackEvent('timeline_import_linkedin', { event_count: eventCount });
}

/** User loads demo data */
export function trackLoadDemo(): void {
  trackEvent('timeline_load_demo');
}

/** User loads a template */
export function trackLoadTemplate(templateName: string): void {
  trackEvent('timeline_load_template', { template_name: templateName });
}

/** User adds a new timeline event */
export function trackAddEvent(): void {
  trackEvent('timeline_add_event');
}

/** User edits an existing timeline event */
export function trackEditEvent(): void {
  trackEvent('timeline_edit_event');
}

/** User deletes a timeline event */
export function trackDeleteEvent(): void {
  trackEvent('timeline_delete_event');
}

/** User copies the share URL */
export function trackShare(): void {
  trackEvent('timeline_share');
}

/** User opens the embed modal */
export function trackEmbed(): void {
  trackEvent('timeline_embed');
}

/** User exports timeline as image */
export function trackExportImage(): void {
  trackEvent('timeline_export_image');
}

/** User clears all timeline data */
export function trackClearAll(): void {
  trackEvent('timeline_clear_all');
}

/** User customizes color settings */
export function trackColorSettings(): void {
  trackEvent('timeline_color_settings');
}
