
import { TimelineItem } from "@/types/timeline";

// Modern Unicode-safe Base64 encoding (replaces deprecated unescape/escape pattern)
function utf8ToBase64(str: string): string {
    return btoa(
        encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
            String.fromCharCode(parseInt(p1, 16))
        )
    );
}

function base64ToUtf8(b64: string): string {
    return decodeURIComponent(
        Array.from(atob(b64), (c) =>
            "%" + c.charCodeAt(0).toString(16).padStart(2, "0")
        ).join("")
    );
}

/** Validates a single TimelineItem has the required fields. */
function isValidTimelineItem(item: unknown): item is TimelineItem {
    if (typeof item !== "object" || item === null) return false;
    const obj = item as Record<string, unknown>;
    return (
        typeof obj.start === "string" &&
        typeof obj.label === "string" &&
        typeof obj.category === "string"
    );
}

/** Encodes timeline data + colorMap to a URL-safe Base64 string. */
export const encodeTimelineData = (
    data: TimelineItem[],
    colorMap: Record<string, string>
): string => {
    try {
        const payload = { d: data, c: colorMap };
        return utf8ToBase64(JSON.stringify(payload));
    } catch (e) {
        console.error("Failed to encode timeline data:", e);
        return "";
    }
};

/** Decodes a Base64 string back to timeline data + colorMap. */
export const decodeTimelineData = (
    encoded: string | null
): { data: TimelineItem[]; colorMap: Record<string, string> } | null => {
    if (!encoded) return null;
    try {
        const json = base64ToUtf8(encoded);
        const parsed = JSON.parse(json);

        // Handle legacy format (direct array without { d, c } envelope)
        if (Array.isArray(parsed)) {
            const valid = parsed.filter(isValidTimelineItem);
            if (valid.length < parsed.length) {
                console.warn(
                    `[url-utils] Filtered ${parsed.length - valid.length} malformed item(s) from legacy payload`
                );
            }
            return { data: valid, colorMap: {} };
        }

        const rawItems: unknown[] = Array.isArray(parsed.d) ? parsed.d : [];
        const valid = rawItems.filter(isValidTimelineItem);
        if (valid.length < rawItems.length) {
            console.warn(
                `[url-utils] Filtered ${rawItems.length - valid.length} malformed item(s) from payload`
            );
        }

        return {
            data: valid,
            colorMap: typeof parsed.c === "object" && parsed.c !== null ? parsed.c : {},
        };
    } catch (e) {
        console.error("Failed to decode timeline data:", e);
        return null;
    }
};
