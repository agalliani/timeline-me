
import { TimelineItem } from "@/types/timeline";

// Helper to safely encode JSON to Base64
export const encodeTimelineData = (data: TimelineItem[], colorMap: Record<string, string>): string => {
    try {
        const payload = { d: data, c: colorMap };
        return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    } catch (e) {
        console.error("Failed to encode timeline data:", e);
        return "";
    }
};

// Helper to decode Base64 to JSON
export const decodeTimelineData = (
    encoded: string | null
): { data: TimelineItem[]; colorMap: Record<string, string> } | null => {
    if (!encoded) return null;
    try {
        const decoded = decodeURIComponent(escape(atob(encoded)));
        const parsed = JSON.parse(decoded);

        // Handle legacy format (direct array)
        if (Array.isArray(parsed)) {
            return { data: parsed, colorMap: {} };
        }

        return {
            data: Array.isArray(parsed.d) ? parsed.d : [],
            colorMap: typeof parsed.c === "object" ? parsed.c : {},
        };
    } catch (e) {
        console.error("Failed to decode timeline data:", e);
        return null;
    }
};
