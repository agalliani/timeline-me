import React, { useMemo, useRef, useState, useEffect } from 'react';
import { TimelineItem } from '@/types/timeline';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Edit2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TimelineVerticalProps {
    data: TimelineItem[];
    className?: string;
    onEdit?: (index: number) => void;
}

// Constants
const PIXELS_PER_MONTH = 60;
const MIN_EVENT_HEIGHT = 40; // Minimum height in pixels
const HEADER_HEIGHT = 40; // Space for the top header

export function TimelineVertical({ data, className, onEdit }: TimelineVerticalProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerWidth(entry.contentRect.width);
            }
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    // 1. Parse Dates and Layout Logic
    const { events, totalHeight, minDateValue } = useMemo(() => {
        if (!data || data.length === 0) return { events: [], totalHeight: 0, minDateValue: 0 };

        // Helper: Parse YYYY-MM to integer (Total Months)
        const getMonthValue = (dateStr: string | null) => {
            if (!dateStr) return 0;
            let year = 0, month = 0;
            if (dateStr.includes('-')) {
                const parts = dateStr.split('-');
                year = parseInt(parts[0]);
                month = parts[1] ? parseInt(parts[1]) - 1 : 0; // 0-indexed month
            } else if (dateStr.includes('/')) {
                const parts = dateStr.split('/');
                if (parts[0].length === 4) {
                    year = parseInt(parts[0]);
                    month = parts[1] ? parseInt(parts[1]) - 1 : 0;
                } else {
                    month = parseInt(parts[0]) - 1;
                    year = parseInt(parts[1]);
                }
            } else {
                year = parseInt(dateStr);
            }
            return year * 12 + month;
        };

        const parsedEvents = data.map((item, index) => {
            const startVal = getMonthValue(item.start);
            const endVal = item.end ? getMonthValue(item.end) : startVal; // Should point events have duration? default to 1 month visually
            return {
                ...item,
                originalIndex: index,
                startVal,
                endVal: Math.max(endVal, startVal), // Ensure end >= start
                duration: Math.max(endVal - startVal, 0.5) // Min duration 0.5 month
            };
        });

        if (parsedEvents.length === 0) return { events: [], totalHeight: 0, minDateValue: 0 };

        // Determine Min/Max for the Container
        let minVal = Math.min(...parsedEvents.map(e => e.startVal));
        let maxVal = Math.max(...parsedEvents.map(e => e.endVal));

        // Pad the timeline a bit
        minVal -= 2;
        maxVal += 4; // Extra padding at bottom

        const totalMonths = maxVal - minVal;
        const totalPx = totalMonths * PIXELS_PER_MONTH;

        // --- Column Packing Algorithm ---
        // 1. Sort by Start Time
        parsedEvents.sort((a, b) => a.startVal - b.startVal || (b.endVal - a.endVal)); // Longest first if starts same

        // 2. Assign columns
        const columns: { endVal: number }[] = [];
        const positionedEvents = parsedEvents.map(event => {
            let colIndex = -1;
            // Find the first column where this event fits
            for (let i = 0; i < columns.length; i++) {
                if (columns[i].endVal <= event.startVal) {
                    colIndex = i;
                    columns[i].endVal = event.endVal;
                    break;
                }
            }
            // If no column fits, create a new one
            if (colIndex === -1) {
                colIndex = columns.length;
                columns.push({ endVal: event.endVal });
            }

            return {
                ...event,
                colIndex,
                top: (event.startVal - minVal) * PIXELS_PER_MONTH,
                height: Math.max(event.duration * PIXELS_PER_MONTH, MIN_EVENT_HEIGHT)
            };
        });

        // 3. Determine Global Max Columns (or ideally local, but global for simple width calculation first)
        const maxColumns = columns.length;

        // For better visual, we might want to know how many columns overlap *locally*, but even width is easier.
        // Let's use maxColumns for uniform width for now.

        return {
            events: positionedEvents.map(e => ({
                ...e,
                totalColumns: maxColumns
            })),
            totalHeight: totalPx,
            minDateValue: minVal
        };

    }, [data]);

    // Grid Generation
    const gridLines = useMemo(() => {
        if (!totalHeight) return [];
        const lines = [];
        // Iterate months from minDateValue
        // We need to inverse minDateValue back to Year/Month
        const startYear = Math.floor(minDateValue / 12);
        const startMonth = minDateValue % 12; // 0-11

        let currentMonth = startMonth;
        let currentYear = startYear;
        // Total months cover
        const totalMonths = Math.ceil(totalHeight / PIXELS_PER_MONTH);

        for (let i = 0; i < totalMonths; i++) {
            const isYearStart = currentMonth === 0;
            const top = i * PIXELS_PER_MONTH;

            lines.push({
                top,
                label: isYearStart ? `${currentYear}` : null,
                isMajor: isYearStart,
                monthName: new Date(currentYear, currentMonth).toLocaleString('default', { month: 'short' })
            });

            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
        }
        return lines;
    }, [minDateValue, totalHeight]);


    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'lorem': return 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-300';
            case 'ipsum': return 'bg-cyan-500/10 border-cyan-500 text-cyan-700 dark:text-cyan-300';
            case 'dolor': return 'bg-yellow-500/10 border-yellow-500 text-yellow-700 dark:text-yellow-300';
            case 'sit': return 'bg-purple-500/10 border-purple-500 text-purple-700 dark:text-purple-300';
            default: return 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-300';
        }
    };

    if (!data || data.length === 0) {
        return (
            <div className="text-center text-muted-foreground p-10 border border-dashed rounded-lg bg-muted/20">
                No timeline data available.
            </div>
        );
    }

    return (
        <div className={cn("relative w-full overflow-hidden select-none", className)} ref={containerRef}>

            <div className="relative w-full" style={{ height: totalHeight }}>
                {/* Background Grid */}
                {gridLines.map((line, i) => (
                    <div
                        key={i}
                        className={cn(
                            "absolute w-full border-t flex items-start",
                            line.isMajor ? "border-foreground/30" : "border-border/50"
                        )}
                        style={{ top: line.top }}
                    >
                        {/* Time Label */}
                        <div className={cn(
                            "w-16 md:w-24 shrink-0 pr-4 text-right pt-1 sticky left-0 z-20",
                            line.isMajor ? "-mt-3" : "-mt-2"
                        )}>
                            {line.isMajor ? (
                                <span className="text-lg font-bold bg-background px-1">{line.label}</span>
                            ) : (
                                <span className="text-xs text-muted-foreground bg-background/80 px-1">{line.monthName}</span>
                            )}
                        </div>
                    </div>
                ))}

                {/* Vertical Current Time Indicator? (Optional) */}

                {/* Events Layer */}
                <div className="absolute top-0 right-0 bottom-0 left-16 md:left-24 pr-4">
                    {/* The content area offset by the time labels width */}

                    {events.map((event, i) => {
                        // Calculate width and left based on total columns
                        // width = (100% / totalColumns) - gap
                        // left = (100% / totalColumns) * colIndex

                        // Use CSS variables or calc for cleaner code if possible, but inline style works
                        return (
                            <div
                                key={i}
                                className={cn(
                                    "absolute rounded-lg border-l-4 p-2 transition-all hover:brightness-95 hover:z-50 cursor-pointer overflow-hidden group shadow-sm",
                                    getCategoryColor(event.category)
                                )}
                                style={{
                                    top: event.top,
                                    height: event.height - 4, // Gap
                                    left: `calc((100% / ${event.totalColumns}) * ${event.colIndex})`,
                                    width: `calc((100% / ${event.totalColumns}) - 8px)`, // Subtract gap
                                }}
                                onClick={() => onEdit?.(event.originalIndex)}
                                title={`${event.label} (${event.start} - ${event.end})`}
                            >
                                <div className="font-semibold text-sm truncate leading-tight">{event.label}</div>
                                <div className="text-xs opacity-70 truncate mt-0.5">
                                    {event.start} {event.end ? `- ${event.end}` : ""}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
