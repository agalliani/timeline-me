import React, { useMemo, useRef, useState, useEffect } from 'react';
import { TimelineItem } from '@/types/timeline';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Edit2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface TimelineVerticalProps {
    data: TimelineItem[];
    className?: string;
    colorMap?: Record<string, string>;
    onEdit?: (index: number) => void;
}

// Constants
const PIXELS_PER_MONTH = 32; // Reduced from 60 for compactness
const MIN_EVENT_HEIGHT = 36; // Minimum height in pixels
const HEADER_HEIGHT = 40;

export function TimelineVertical({ data, className, colorMap = {}, onEdit }: TimelineVerticalProps) {
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
            const endVal = item.end ? getMonthValue(item.end) : startVal;
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

        const maxColumns = columns.length;

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


    const getCategoryClasses = (category: string) => {
        const colorName = colorMap[category] || 'slate';
        switch (colorName) {
            case 'red': return 'bg-red-50 border-red-500 text-red-900 group-hover:bg-red-100 dark:bg-red-950/30 dark:border-red-500 dark:text-red-100';
            case 'orange': return 'bg-orange-50 border-orange-500 text-orange-900 group-hover:bg-orange-100 dark:bg-orange-950/30 dark:border-orange-500 dark:text-orange-100';
            case 'amber': return 'bg-amber-50 border-amber-500 text-amber-900 group-hover:bg-amber-100 dark:bg-amber-950/30 dark:border-amber-500 dark:text-amber-100';
            case 'yellow': return 'bg-yellow-50 border-yellow-500 text-yellow-900 group-hover:bg-yellow-100 dark:bg-yellow-950/30 dark:border-yellow-500 dark:text-yellow-100';
            case 'lime': return 'bg-lime-50 border-lime-500 text-lime-900 group-hover:bg-lime-100 dark:bg-lime-950/30 dark:border-lime-500 dark:text-lime-100';
            case 'green': return 'bg-green-50 border-green-500 text-green-900 group-hover:bg-green-100 dark:bg-green-950/30 dark:border-green-500 dark:text-green-100';
            case 'emerald': return 'bg-emerald-50 border-emerald-500 text-emerald-900 group-hover:bg-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-500 dark:text-emerald-100';
            case 'teal': return 'bg-teal-50 border-teal-500 text-teal-900 group-hover:bg-teal-100 dark:bg-teal-950/30 dark:border-teal-500 dark:text-teal-100';
            case 'cyan': return 'bg-cyan-50 border-cyan-500 text-cyan-900 group-hover:bg-cyan-100 dark:bg-cyan-950/30 dark:border-cyan-500 dark:text-cyan-100';
            case 'sky': return 'bg-sky-50 border-sky-500 text-sky-900 group-hover:bg-sky-100 dark:bg-sky-950/30 dark:border-sky-500 dark:text-sky-100';
            case 'blue': return 'bg-blue-50 border-blue-500 text-blue-900 group-hover:bg-blue-100 dark:bg-blue-950/30 dark:border-blue-500 dark:text-blue-100';
            case 'indigo': return 'bg-indigo-50 border-indigo-500 text-indigo-900 group-hover:bg-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-500 dark:text-indigo-100';
            case 'violet': return 'bg-violet-50 border-violet-500 text-violet-900 group-hover:bg-violet-100 dark:bg-violet-950/30 dark:border-violet-500 dark:text-violet-100';
            case 'purple': return 'bg-purple-50 border-purple-500 text-purple-900 group-hover:bg-purple-100 dark:bg-purple-950/30 dark:border-purple-500 dark:text-purple-100';
            case 'fuchsia': return 'bg-fuchsia-50 border-fuchsia-500 text-fuchsia-900 group-hover:bg-fuchsia-100 dark:bg-fuchsia-950/30 dark:border-fuchsia-500 dark:text-fuchsia-100';
            case 'pink': return 'bg-pink-50 border-pink-500 text-pink-900 group-hover:bg-pink-100 dark:bg-pink-950/30 dark:border-pink-500 dark:text-pink-100';
            case 'rose': return 'bg-rose-50 border-rose-500 text-rose-900 group-hover:bg-rose-100 dark:bg-rose-950/30 dark:border-rose-500 dark:text-rose-100';
            default: return 'bg-slate-50 border-slate-500 text-slate-900 group-hover:bg-slate-100 dark:bg-slate-800/50 dark:border-slate-500 dark:text-slate-100';
        }
    };

    const getTooltipCategoryStyle = (category: string) => {
        const colorName = colorMap[category] || 'slate';
        switch (colorName) {
            case 'red': return 'border-red-500 text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-900/10';
            case 'orange': return 'border-orange-500 text-orange-700 bg-orange-50 dark:text-orange-300 dark:bg-orange-900/10';
            case 'amber': return 'border-amber-500 text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-900/10';
            case 'yellow': return 'border-yellow-500 text-yellow-700 bg-yellow-50 dark:text-yellow-300 dark:bg-yellow-900/10';
            case 'lime': return 'border-lime-500 text-lime-700 bg-lime-50 dark:text-lime-300 dark:bg-lime-900/10';
            case 'green': return 'border-green-500 text-green-700 bg-green-50 dark:text-green-300 dark:bg-green-900/10';
            case 'emerald': return 'border-emerald-500 text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-900/10';
            case 'teal': return 'border-teal-500 text-teal-700 bg-teal-50 dark:text-teal-300 dark:bg-teal-900/10';
            case 'cyan': return 'border-cyan-500 text-cyan-700 bg-cyan-50 dark:text-cyan-300 dark:bg-cyan-900/10';
            case 'sky': return 'border-sky-500 text-sky-700 bg-sky-50 dark:text-sky-300 dark:bg-sky-900/10';
            case 'blue': return 'border-blue-500 text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-900/10';
            case 'indigo': return 'border-indigo-500 text-indigo-700 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-900/10';
            case 'violet': return 'border-violet-500 text-violet-700 bg-violet-50 dark:text-violet-300 dark:bg-violet-900/10';
            case 'purple': return 'border-purple-500 text-purple-700 bg-purple-50 dark:text-purple-300 dark:bg-purple-900/10';
            case 'fuchsia': return 'border-fuchsia-500 text-fuchsia-700 bg-fuchsia-50 dark:text-fuchsia-300 dark:bg-fuchsia-900/10';
            case 'pink': return 'border-pink-500 text-pink-700 bg-pink-50 dark:text-pink-300 dark:bg-pink-900/10';
            case 'rose': return 'border-rose-500 text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-900/10';
            default: return 'border-slate-500 text-slate-700 bg-slate-50 dark:text-slate-300 dark:bg-slate-900/10';
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
        <TooltipProvider delayDuration={300}>
            <div className={cn("relative w-full overflow-hidden select-none bg-background rounded-xl border shadow-sm", className)} ref={containerRef}>

                <div className="relative w-full transition-all duration-500 ease-in-out" style={{ height: totalHeight }}>
                    {/* Background Grid */}
                    {gridLines.map((line, i) => (
                        <div
                            key={i}
                            className={cn(
                                "absolute w-full border-t flex items-start transition-opacity duration-300",
                                line.isMajor ? "border-foreground/20 opacity-100" : "border-border/40 opacity-50"
                            )}
                            style={{ top: line.top }}
                        >
                            {/* Time Label */}
                            <div className={cn(
                                "w-20 md:w-28 shrink-0 pr-4 text-right pt-1 sticky left-0 z-20 flex justify-end items-center",
                                line.isMajor ? "-mt-3.5" : "-mt-2"
                            )}>
                                {line.isMajor ? (
                                    <span className="text-lg font-bold bg-background/95 backdrop-blur-sm px-2 py-0.5 rounded-md shadow-sm border border-border/50 text-foreground">
                                        {line.label}
                                    </span>
                                ) : (
                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 bg-background/80 px-1 rounded-sm">
                                        {line.monthName}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Events Layer */}
                    <div className="absolute top-0 right-0 bottom-0 left-20 md:left-28 pr-4 py-4">
                        {/* The content area offset by the time labels width */}

                        {events.map((event, i) => {
                            const isSmall = event.height < 50;

                            return (
                                <Tooltip key={i}>
                                    <TooltipTrigger asChild>
                                        <div
                                            className={cn(
                                                "absolute rounded-md border-l-[6px] px-2 py-1 transition-all duration-200 cursor-pointer overflow-hidden group shadow-sm hover:shadow-md hover:z-50 hover:scale-[1.01] hover:translate-x-1 flex flex-col justify-center",
                                                getCategoryClasses(event.category)
                                            )}
                                            style={{
                                                top: event.top,
                                                height: event.height - 4, // Gap
                                                left: `calc((100% / ${event.totalColumns}) * ${event.colIndex})`,
                                                width: `calc((100% / ${event.totalColumns}) - 12px)`, // Subtract gap
                                            }}
                                            onClick={() => onEdit?.(event.originalIndex)}
                                        >
                                            <div className={cn("font-bold truncate leading-tight tracking-tight", isSmall ? "text-xs" : "text-sm")}>{event.label}</div>
                                            {!isSmall && (
                                                <div className="flex items-center gap-1.5 text-xs opacity-75 truncate mt-0.5">
                                                    <CalendarIcon className="w-3 h-3" />
                                                    <span>{event.start}</span>
                                                </div>
                                            )}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" align="start" className="p-0 border-none bg-transparent shadow-xl z-50">
                                        <Card className={cn("w-72 border-l-4", getTooltipCategoryStyle(event.category).split(' ')[0])}>
                                            <CardHeader className="p-4 pb-2 bg-muted/5">
                                                <CardTitle className="text-base leading-snug">{event.label}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-3 text-sm space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <Badge variant="outline" className={cn("text-xs uppercase tracking-wide font-medium", getTooltipCategoryStyle(event.category))}>
                                                        {event.category}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground font-mono">
                                                        {event.duration} months
                                                    </span>
                                                </div>

                                                <span className="font-medium text-foreground/80">{event.start} — {event.end || 'Ongoing'}</span>

                                                {event.description && (
                                                    <div className="text-muted-foreground bg-muted/10 p-2 rounded-md max-h-[150px] overflow-y-auto text-xs leading-relaxed whitespace-pre-wrap">
                                                        {event.description}
                                                    </div>
                                                )}

                                                {/* Edit Hint */}
                                                <div className="text-[10px] text-muted-foreground pt-2 border-t flex items-center gap-1">
                                                    <Edit2 className="w-3 h-3" />
                                                    Click to edit details
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </div>
                </div>
            </div>
        </TooltipProvider >
    );
}
