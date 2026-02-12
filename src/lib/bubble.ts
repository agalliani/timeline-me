import { DateObj } from "@/types/timeline";

export class Bubble {
    widthMonth: number;
    min: number;
    start: DateObj;
    end: DateObj | null;

    constructor(widthMonth: number, min: number, start: DateObj, end: DateObj | null) {
        this.min = min;
        this.start = start;
        this.end = end;
        this.widthMonth = widthMonth;
    }

    /**
     * Formats a number to a two-digit string (e.g., 9 -> "09")
     */
    private formatMonth(num: number): string | number {
        return num >= 10 ? num : '0' + num;
    }

    getStartOffset(): number {
        return (this.widthMonth / 12) * (12 * (this.start.date.getFullYear() - this.min) + this.start.date.getMonth());
    }

    getFullYears(): number {
        return ((this.end && this.end.date.getFullYear()) || this.start.date.getFullYear()) - this.start.date.getFullYear();
    }

    getMonths(): number {
        const fullYears = this.getFullYears();
        let months = 0;

        if (!this.end) {
            months += !this.start.hasMonth ? 12 : 1;
        } else {
            if (!this.end.hasMonth) {
                months += 12 - (this.start.hasMonth ? this.start.date.getMonth() : 0);
                months += 12 * (fullYears - 1 > 0 ? fullYears - 1 : 0);
            } else {
                months += this.end.date.getMonth() + 1;
                months += 12 - (this.start.hasMonth ? this.start.date.getMonth() : 0);
                months += 12 * (fullYears - 1);
            }
        }

        return months;
    }

    getWidth(): number {
        return (this.widthMonth / 12) * this.getMonths();
    }

    getDateLabel(): string {
        return [
            (this.start.hasMonth ? this.formatMonth(this.start.date.getMonth() + 1) + '/' : '') + this.start.date.getFullYear(),
            (this.end ? '-' + ((this.end.hasMonth ? this.formatMonth(this.end.date.getMonth() + 1) + '/' : '') + this.end.date.getFullYear()) : '')
        ].join('');
    }
}
