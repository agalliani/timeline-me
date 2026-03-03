import { describe, it, expect } from 'vitest';
import { formatDateLabel } from '../bubble';
import { DateObj } from '@/types/timeline';

function dateObj(year: number, month: number, hasMonth: boolean): DateObj {
    return {
        date: new Date(year, month, 1), // month is 0-based internally
        hasMonth,
    };
}

describe('formatDateLabel', () => {
    it('formats month-precise range: "01/2020-06/2022"', () => {
        const start = dateObj(2020, 0, true);  // January 2020
        const end = dateObj(2022, 5, true);    // June 2022
        expect(formatDateLabel(start, end)).toBe('01/2020-06/2022');
    });

    it('formats year-only range: "2019-2022"', () => {
        const start = dateObj(2019, 0, false);
        const end = dateObj(2022, 0, false);
        expect(formatDateLabel(start, end)).toBe('2019-2022');
    });

    it('formats open-ended month event: "01/2020"', () => {
        const start = dateObj(2020, 0, true);
        expect(formatDateLabel(start, null)).toBe('01/2020');
    });

    it('formats open-ended year-only event: "2019"', () => {
        const start = dateObj(2019, 0, false);
        expect(formatDateLabel(start, null)).toBe('2019');
    });

    it('zero-pads single-digit months: "03/2021"', () => {
        const start = dateObj(2021, 2, true);  // March
        const end = dateObj(2021, 8, true);    // September
        expect(formatDateLabel(start, end)).toBe('03/2021-09/2021');
    });

    it('formats December correctly: month=12', () => {
        const start = dateObj(2023, 11, true); // December (month index 11)
        expect(formatDateLabel(start, null)).toBe('12/2023');
    });
});
