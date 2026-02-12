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
        const effectiveWidth = widthMonth || this.widthMonth;
        const bubbles: BubbleModel[] = [];

        for (let n = 0, m = this.data.length; n < m; n++) {
            const cur = this.data[n];
            // Here we pass effectiveWidth. Note: Legacy Bubble constructor takes widthMonth as first arg.
            const bubble = new Bubble(effectiveWidth, this.year.min, cur.start, cur.end);

            bubbles.push({
                marginLeft: bubble.getStartOffset(),
                width: bubble.getWidth(),
                class: 'bubble bubble-' + (cur.type || 'default'),
                duration: cur.end ? Math.round((cur.end.date.getTime() - cur.start.date.getTime()) / 1000 / 60 / 60 / 24 / 39).toString() : '',
                dateLabel: bubble.getDateLabel(),
                label: cur.label
            });
        }

        // Add empty bubble for offset
        const offsetStart: DateObj = { date: new Date(this.year.min, 0, -1, 1), hasMonth: false };
        const offsetEnd: DateObj = { date: new Date(this.year.max + 2, 11, -1, 1), hasMonth: false };
        const offsetBubble = new Bubble(effectiveWidth, this.year.min, offsetStart, offsetEnd);

        bubbles.push({
            marginLeft: 0,
            width: offsetBubble.getWidth(),
            class: 'bubble bubble-empty',
            duration: '',
            dateLabel: '',
            label: ''
        });

        return bubbles;
    }
}
