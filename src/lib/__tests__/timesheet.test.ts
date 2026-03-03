import { describe, it, expect } from 'vitest';
import { Timesheet } from '../timesheet';

// ---------------------------------------------------------------------------
// Helper: build a minimal single-item timesheet
// ---------------------------------------------------------------------------
function makeTimesheet(start: string, end: string | null = null, min = 2019, max = 2026) {
    return new Timesheet(min, max, [
        { start, end, label: 'Test', category: 'Work' },
    ]);
}

// ---------------------------------------------------------------------------
// parseDate — via getGridBubbles() observable outputs
// ---------------------------------------------------------------------------
describe('Timesheet date parsing', () => {
    it('parses "01/2020" as January 2020 (hasMonth=true)', () => {
        const ts = makeTimesheet('01/2020', '01/2020');
        const [bubble] = ts.getGridBubbles();
        // dateLabel should show "01/2020-01/2020"
        expect(bubble.dateLabel).toContain('01/2020');
    });

    it('parses "12/2023" as December 2023', () => {
        const ts = makeTimesheet('12/2023', '12/2023');
        const [bubble] = ts.getGridBubbles();
        expect(bubble.dateLabel).toContain('12/2023');
    });

    it('parses year-only "2019" (hasMonth=false)', () => {
        const ts = new Timesheet(2019, 2019, [
            { start: '2019', end: null, label: 'Year event', category: 'Work' },
        ]);
        const [bubble] = ts.getGridBubbles();
        // Year-only: dateLabel should be just "2019"
        expect(bubble.dateLabel).toBe('2019');
    });

    it('correctly anchors January: startColumn=1 for first year, first month', () => {
        const ts = new Timesheet(2020, 2020, [
            { start: '01/2020', end: '01/2020', label: 'Jan', category: 'c' },
        ]);
        const [bubble] = ts.getGridBubbles();
        expect(bubble.gridColumnStart).toBe(1);
    });

    it('correctly anchors December: startColumn=12 for first year, last month', () => {
        const ts = new Timesheet(2020, 2020, [
            { start: '12/2020', end: '12/2020', label: 'Dec', category: 'c' },
        ]);
        const [bubble] = ts.getGridBubbles();
        expect(bubble.gridColumnStart).toBe(12);
    });
});

// ---------------------------------------------------------------------------
// getGridBubbles — span calculation
// ---------------------------------------------------------------------------
describe('Timesheet.getGridBubbles()', () => {
    it('start="01/2020" end="06/2020" → gridColumnStart=1, span=6', () => {
        const ts = new Timesheet(2020, 2020, [
            { start: '01/2020', end: '06/2020', label: 'L', category: 'c' },
        ]);
        const [bubble] = ts.getGridBubbles();
        expect(bubble.gridColumnStart).toBe(1);
        expect(bubble.gridColumnSpan).toBe(6);
    });

    it('open-ended month event → span=1', () => {
        const ts = new Timesheet(2020, 2020, [
            { start: '01/2020', end: null, label: 'L', category: 'c' },
        ]);
        const [bubble] = ts.getGridBubbles();
        expect(bubble.gridColumnSpan).toBe(1);
    });

    it('open-ended year-only event → span=12', () => {
        const ts = new Timesheet(2020, 2020, [
            { start: '2020', end: null, label: 'L', category: 'c' },
        ]);
        const [bubble] = ts.getGridBubbles();
        expect(bubble.gridColumnSpan).toBe(12);
    });

    it('span minimum is 1 even for same-month start=end', () => {
        const ts = new Timesheet(2020, 2020, [
            { start: '03/2020', end: '03/2020', label: 'L', category: 'c' },
        ]);
        const [bubble] = ts.getGridBubbles();
        expect(bubble.gridColumnSpan).toBeGreaterThanOrEqual(1);
    });

    it('second-year event has correct startColumn offset', () => {
        const ts = new Timesheet(2020, 2021, [
            { start: '01/2021', end: '01/2021', label: 'L', category: 'c' },
        ]);
        const [bubble] = ts.getGridBubbles();
        // Jan 2021 = 2nd year * 12 + 0 + 1 = 13
        expect(bubble.gridColumnStart).toBe(13);
    });
});

// ---------------------------------------------------------------------------
// getYears()
// ---------------------------------------------------------------------------
describe('Timesheet.getYears()', () => {
    it('returns correct range with 2-year buffer', () => {
        const ts = new Timesheet(2020, 2022, []);
        const years = ts.getYears();
        expect(years[0]).toBe(2020);
        expect(years[years.length - 1]).toBe(2024); // max + 2
    });
});
