export interface TimelineItem {
    start: string; // Format: "MM/YYYY" or "YYYY"
    end: string | null; // Format: "MM/YYYY" or "YYYY" or null
    label: string;
    category: string;
    description?: string;
}

export interface DateObj {
    date: Date;
    hasMonth: boolean;
}

export interface ParsedTimelineItem {
    start: DateObj;
    end: DateObj | null;
    label: string;
    type: string;
}

export interface BubbleModel {
    marginLeft: number; // Legacy
    width: number;      // Legacy
    class: string;
    duration: string;
    dateLabel: string;
    dateLabel: string;
    label: string;
    description?: string;

    // Grid Support
    gridColumnStart?: number;
    gridColumnSpan?: number;
}
