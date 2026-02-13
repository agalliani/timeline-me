import React, { useMemo, forwardRef } from 'react';
import { Timesheet } from '@/lib/timesheet';
import { TimelineItem } from '@/types/timeline';
import { cn } from '@/lib/utils';

interface TimelineDisplayProps {
    data: TimelineItem[];
    minYear?: number;
    maxYear?: number;
    className?: string;
    onEdit?: (index: number) => void;
}

export const TimelineDisplay = forwardRef<HTMLDivElement, TimelineDisplayProps>(({ data, minYear = 2020, maxYear = 2026, className, onEdit }, ref) => {

    const { bubbles, years, totalMonths, minYear: derivedMin } = useMemo(() => {
        const ts = new Timesheet(minYear, maxYear, data);

        // Ensure years are calculated correctly for the grid
        const years = ts.getYears();
        const bubbles = ts.getGridBubbles();
        const totalMonths = ts.getTotalMonths();

        return { bubbles, years, totalMonths, minYear: ts.year.min };
    }, [data, minYear, maxYear]);

    if (!data || data.length === 0) {
        return (
            <div className="text-center text-muted-foreground p-10 border border-dashed rounded-lg bg-muted/20">
                No timeline data yet. Add some items to visualize!
            </div>
        );
    }

    // Grid column width configuration
    const COL_WIDTH = "minmax(40px, 1fr)";

    return (
        <div ref={ref} className="w-full overflow-x-auto border rounded-lg bg-[#1c1917] shadow-xl p-4">
            <div
                className="grid gap-y-2 relative"
                style={{
                    // Use CSS Grid for columns
                    gridTemplateColumns: `repeat(${totalMonths}, ${COL_WIDTH})`,
                    // Rows will be auto-generated
                    gridAutoFlow: "row dense", // Try to pack items closely
                }}
            >
                {/* Year Markers (First Row) */}
                {years.map((year, i) => {
                    // Calculate start column for the year
                    // (Year - MinYear) * 12 + 1
                    const colStart = (year - derivedMin) * 12 + 1;
                    return (
                        <div
                            key={year}
                            className="text-white/90 text-xs font-medium font-mono border-l border-white/20 pl-2 pt-2 pb-4 sticky top-0"
                            style={{
                                gridColumnStart: colStart,
                                gridColumnEnd: `span 12`,
                                gridRow: 1, // Force to first row
                            }}
                        >
                            {year}
                        </div>
                    );
                })}

                {/* Timeline Events */}
                {bubbles.map((bubble, index) => (
                    <div
                        key={index}
                        onClick={() => onEdit?.(index)}
                        title={`${bubble.label} (${bubble.dateLabel})`}
                        className={cn(
                            "relative group rounded h-10 flex items-center px-2 transition-all hover:brightness-110 hover:z-10",
                            onEdit ? "cursor-pointer hover:ring-2 hover:ring-white/50" : "",
                            bubble.class
                        )}
                        style={{
                            gridColumnStart: bubble.gridColumnStart,
                            gridColumnEnd: `span ${bubble.gridColumnSpan}`,
                            // We let grid-auto-flow place them in rows
                        }}
                    >
                        {/* Bubble Content */}
                        <div className="flex flex-col leading-none truncate w-full">
                            <span className="text-[10px] text-white/70 uppercase tracking-wider mb-0.5">
                                {bubble.dateLabel}
                            </span>
                            <span className="text-sm font-medium text-white truncate shadow-sm">
                                {bubble.label}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

TimelineDisplay.displayName = "TimelineDisplay";
