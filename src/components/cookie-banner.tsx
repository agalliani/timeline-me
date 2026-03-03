'use client';

import { useEffect, useState } from 'react';

const CONSENT_KEY = 'cookie-consent';

/**
 * Grants or denies GA4 analytics storage via Consent Mode v2.
 * Safe to call even when gtag is not loaded (production-only guard in google-analytics.tsx).
 */
function updateGAConsent(granted: boolean) {
    if (typeof window === 'undefined') return;
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtag === 'function') {
        gtag('consent', 'update', {
            analytics_storage: granted ? 'granted' : 'denied',
        });
    }
}

export function CookieBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(CONSENT_KEY);
        if (stored === null) {
            // First visit — show the banner
            setVisible(true);
        } else if (stored === 'granted') {
            // Previously accepted — restore consent without showing banner
            updateGAConsent(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem(CONSENT_KEY, 'granted');
        updateGAConsent(true);
        setVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem(CONSENT_KEY, 'denied');
        updateGAConsent(false);
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div
            role="dialog"
            aria-label="Cookie consent"
            className="fixed bottom-0 left-0 right-0 z-[9999] flex justify-center p-4 pointer-events-none"
        >
            <div className="pointer-events-auto w-full max-w-2xl rounded-xl border border-zinc-200 bg-white/95 backdrop-blur-md shadow-lg dark:bg-zinc-900/95 dark:border-zinc-700 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    <span>
                        We use <strong>Google Analytics</strong> to understand how you use this app.
                        No personal data is collected.{' '}
                    </span>
                    <details className="inline">
                        <summary className="cursor-pointer text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 underline underline-offset-2 text-xs">
                            Learn more
                        </summary>
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                            GA4 collects anonymous usage statistics (page views, feature usage) with IP
                            anonymisation enabled. No cross-site tracking, no personal information. Data
                            retention is set to 14 months. You can withdraw consent at any time by
                            clearing your browser&apos;s local storage.
                        </p>
                    </details>
                </div>
                <div className="flex gap-2 shrink-0">
                    <button
                        onClick={handleDecline}
                        className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        Decline
                    </button>
                    <button
                        onClick={handleAccept}
                        className="text-xs px-3 py-1.5 rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 transition-colors font-medium"
                    >
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
}
