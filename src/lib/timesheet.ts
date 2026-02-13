import { Bubble } from "./bubble";
import { TimelineItem, ParsedTimelineItem, BubbleModel, DateObj } from "@/types/timeline";

export class Timesheet {
    data: ParsedTimelineItem[];
    year: {
        min: number;
        max: number;
    };
    widthMonth: number = 59; // Default width, can be configured

    constructor(min: number, max: number, data: TimelineItem[]) {
        this.data = [];
        this.year = { min: min, max: max };
        this.parse(data || []);
    }

    private parse(data: TimelineItem[]) {
        for (let n = 0, m = data.length; n < m; n++) {
            const item = data[n];
            const begin = this.parseDate(item.start);
            // Determine end date: if item.end is present, parse it.
            const end = item.end ? this.parseDate(item.end) : null;

            if (begin.date.getFullYear() < this.year.min) {
                this.year.min = begin.date.getFullYear();
            }

            if (end && end.date.getFullYear() > this.year.max) {
                this.year.max = end.date.getFullYear();
            } else if (begin.date.getFullYear() > this.year.max) {
                this.year.max = begin.date.getFullYear();
            }

            this.data.push({
                start: begin,
                end: end,
                label: item.label,
                type: item.category
            });
        }
    }

    private parseDate(dateInfo: string): DateObj {
        const dateObj: DateObj = { date: new Date(), hasMonth: false };

        if (dateInfo.includes('/') === false) {
            dateObj.date = new Date(parseInt(dateInfo, 10), 0, 1);
            dateObj.hasMonth = false;
        } else {
            const splittedDateInfo = dateInfo.split('/');
            // Legacy logic: [0] is Month, [1] is Year.
            // JS Date Month is 0-indexed.
            const month = parseInt(splittedDateInfo[0], 10); // Expecting 0-11 if input is like legacy? 
            // WAIT. If input is "MM/YYYY", typically users write "01/2020" for January.
            // Legacy code: `parseInt(splittedDateInfo[0], 10)` passed as month.
            // If legacy input was 1-based (e.g. 1 for Jan), then `new Date(Y, 1, ...)` is Feb.
            // Let's assume input is 1-based "MM/YYYY".
            // `new Date(year, month - 1, ...)` would be correct.
            // BUT legacy code did: `new Date(..., parseInt(splittedDateInfo[0], 10), ...)` without -1?
            // Or did it?
            // Legacy: `new Date(parseInt(splittedDateInfo[1], 10), parseInt(splittedDateInfo[0], 10), -1, 1)`
            // If user typed "01/2020", it did `new Date(2020, 1, -1)`. 
            // 2020, Month 1 (Feb), Day -1. 
            // Feb 1st minus 2 days? No, Day 1 is 1st. Day 0 is last of prev month. Day -1 is 2 days before end of prev month.
            // So `new Date(2020, 1, -1)` -> Jan 30, 2020?
            // This seems like a weird legacy quirk or bug.
            // AND `hasMonth = true`.
            // I will preserve the exact logic for now to ensure visual parity, assuming legacy "worked".

            const rawMonth = parseInt(splittedDateInfo[0], 10);
            const year = parseInt(splittedDateInfo[1], 10);

            dateObj.date = new Date(year, rawMonth, -1, 1);
            dateObj.hasMonth = true;
        }

        return dateObj;
    }

    getYears(): number[] {
        const years: number[] = [];
        for (let c = this.year.min; c <= this.year.max + 2; c++) {
            years.push(c);
        }
        return years;
    }

    getBubbles(widthMonth?: number): BubbleModel[] {
        // ... legacy implementation wrapper or deprecation notice?
        // Let's keep it for safety but recommend getGridBubbles
        return this.getGridBubbles().map(b => ({
            ...b,
            marginLeft: 0, // No longer used in grid
            width: 0       // No longer used in grid
        }));
    }

    getGridBubbles(): BubbleModel[] {
        const bubbles: BubbleModel[] = [];

        for (let n = 0, m = this.data.length; n < m; n++) {
            const cur = this.data[n];

            // Calculate Start Column (1-based)
            // (Year - MinYear) * 12 + Month + 1
            const monthIndex = cur.start.date.getMonth(); // 0-11
            const yearDiff = cur.start.date.getFullYear() - this.year.min;
            const startColumn = (yearDiff * 12) + monthIndex + 1;

            // Calculate Span (Duration in months)
            // Logic borrowed from Bubble.getMonths() but simplified
            let durationMonths = 0;
            const fullYears = ((cur.end && cur.end.date.getFullYear()) || cur.start.date.getFullYear()) - cur.start.date.getFullYear();

            if (!cur.end) {
                // Point event or single year?
                // Legacy: !hasMonth ? 12 : 1
                durationMonths = !cur.start.hasMonth ? 12 : 1;
            } else {
                // Complex duration calculation
                // We can reuse Bubble logic if we import it, or re-implement cleanly.
                // Let's re-implement key parts:
                if (!cur.end.hasMonth) {
                    // End is a full year. 
                    // Start might be a month.
                    // (12 - startMonth) + (12 * (fullYears - 1 or 0))
                    // If fullYears > 0
                    if (fullYears > 0) {
                        durationMonths += (12 - (cur.start.hasMonth ? cur.start.date.getMonth() : 0));
                        durationMonths += 12 * (fullYears - 1);
                    } else {
                        // Same year?
                        durationMonths += (12 - cur.start.date.getMonth());
                    }
                } else {
                    // End has specific month
                    // (EndMonth + 1) + (12-StartMonth) + 12*(fullYears-1)?
                    // Careful with overlaps.
                    // Diff in months = (EndYear - StartYear)*12 + (EndMonth - StartMonth) + 1 (inclusive)
                    const endTotal = (cur.end.date.getFullYear() * 12) + cur.end.date.getMonth();
                    const startTotal = (cur.start.date.getFullYear() * 12) + cur.start.date.getMonth();
                    durationMonths = endTotal - startTotal + 1; // Inclusive
                }
            }

            // Safety
            if (durationMonths < 1) durationMonths = 1;

            const bubble = new Bubble(0, this.year.min, cur.start, cur.end); // Just for helpers if needed

            bubbles.push({
                marginLeft: 0,
                width: 0,
                gridColumnStart: startColumn,
                gridColumnSpan: durationMonths,
                class: 'bubble bubble-' + (cur.type || 'default'),
                duration: cur.end ? Math.round((cur.end.date.getTime() - cur.start.date.getTime()) / 1000 / 60 / 60 / 24 / 39).toString() : '',
                dateLabel: bubble.getDateLabel(), // Reusing Bubble for formatting
                label: cur.label
            });
        }

        return bubbles;
    }

    getTotalMonths(): number {
        return (this.year.max - this.year.min + 3) * 12; // +3 years buffer
    }
}
