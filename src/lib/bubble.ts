import { DateObj } from "@/types/timeline";

/**
 * Formats a number to a two-digit string (e.g., 9 -> "09")
 */
function formatMonth(num: number): string | number {
    return num >= 10 ? num : '0' + num;
}

/**
 * Generates a formatted date string for the timeline bubble based on Start and End dates.
 */
export function formatDateLabel(start: DateObj, end: DateObj | null): string {
    return [
        (start.hasMonth ? formatMonth(start.date.getMonth() + 1) + '/' : '') + start.date.getFullYear(),
        (end ? '-' + ((end.hasMonth ? formatMonth(end.date.getMonth() + 1) + '/' : '') + end.date.getFullYear()) : '')
    ].join('');
}
