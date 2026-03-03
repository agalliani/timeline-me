import { describe, it, expect } from 'vitest';
import { encodeTimelineData, decodeTimelineData } from '../url-utils';
import { TimelineItem } from '@/types/timeline';

const SAMPLE_ITEMS: TimelineItem[] = [
    { start: '01/2020', end: '06/2022', label: 'Engineer', category: 'Work', description: 'Test desc' },
    { start: '2018', end: '2020', label: 'University', category: 'Education' },
];

const SAMPLE_COLOR_MAP: Record<string, string> = {
    Work: '#3b82f6',
    Education: '#10b981',
};

describe('encodeTimelineData / decodeTimelineData roundtrip', () => {
    it('encodes and decodes back to original data and colorMap', () => {
        const encoded = encodeTimelineData(SAMPLE_ITEMS, SAMPLE_COLOR_MAP);
        expect(encoded).toBeTruthy();

        const decoded = decodeTimelineData(encoded);
        expect(decoded).not.toBeNull();
        expect(decoded!.data).toHaveLength(SAMPLE_ITEMS.length);
        expect(decoded!.data[0].label).toBe('Engineer');
        expect(decoded!.colorMap['Work']).toBe('#3b82f6');
    });

    it('roundtrip preserves all item fields', () => {
        const encoded = encodeTimelineData(SAMPLE_ITEMS, {});
        const decoded = decodeTimelineData(encoded);
        expect(decoded!.data[0]).toMatchObject(SAMPLE_ITEMS[0]);
    });

    it('empty array roundtrip returns empty data', () => {
        const encoded = encodeTimelineData([], {});
        const decoded = decodeTimelineData(encoded);
        expect(decoded).not.toBeNull();
        expect(decoded!.data).toHaveLength(0);
        expect(decoded!.colorMap).toEqual({});
    });

    it('roundtrip works with Unicode characters in labels', () => {
        const unicodeItems: TimelineItem[] = [
            { start: '01/2020', end: null, label: 'Ingénieur à Paris 🚀', category: 'Work' },
        ];
        const encoded = encodeTimelineData(unicodeItems, {});
        const decoded = decodeTimelineData(encoded);
        expect(decoded!.data[0].label).toBe('Ingénieur à Paris 🚀');
    });
});

describe('decodeTimelineData — edge cases', () => {
    it('returns null for null input', () => {
        expect(decodeTimelineData(null)).toBeNull();
    });

    it('returns null for invalid Base64', () => {
        expect(decodeTimelineData('not-valid-base64!!!')).toBeNull();
    });

    it('handles legacy format (direct array without d/c envelope)', () => {
        // Legacy: btoa(JSON.stringify([item]))
        const legacyItem: TimelineItem = { start: '2019', end: null, label: 'Legacy', category: 'Work' };
        // Manually construct a legacy-format encoded string using modern encoder
        const legacyEncoded = btoa(
            encodeURIComponent(JSON.stringify([legacyItem])).replace(
                /%([0-9A-F]{2})/g,
                (_, p1) => String.fromCharCode(parseInt(p1, 16))
            )
        );
        const decoded = decodeTimelineData(legacyEncoded);
        expect(decoded).not.toBeNull();
        expect(decoded!.data[0].label).toBe('Legacy');
        expect(decoded!.colorMap).toEqual({});
    });

    it('filters out malformed items missing required fields', () => {
        const mixed = [
            { start: '01/2020', label: 'Valid', category: 'Work', end: null } as TimelineItem,
            { start: '01/2020' } as unknown as TimelineItem, // missing label and category
        ];
        const encoded = encodeTimelineData(mixed, {});
        const decoded = decodeTimelineData(encoded);
        // Only the valid item should survive
        expect(decoded!.data).toHaveLength(1);
        expect(decoded!.data[0].label).toBe('Valid');
    });
});
