export interface TimelineItem {
    start: string; // Format: "MM/YYYY" or "YYYY"
    end: string | null; // Format: "MM/YYYY" or "YYYY" or null
    label: string;
    category: string;
}
