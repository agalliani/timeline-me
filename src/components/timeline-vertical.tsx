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
    onEdit?: (index: number) => void;
}

// Constants
const PIXELS_PER_MONTH = 32; // Reduced from 60 for compactness
const MIN_EVENT_HEIGHT = 36; // Minimum height in pixels
const HEADER_HEIGHT = 40;

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


    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'lorem': return 'bg-emerald-50 border-emerald-500 text-emerald-900 hover:bg-emerald-100 hover:border-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-500 dark:text-emerald-100 dark:hover:bg-emerald-900/30';
            case 'ipsum': return 'bg-sky-50 border-sky-500 text-sky-900 hover:bg-sky-100 hover:border-sky-600 dark:bg-sky-900/20 dark:border-sky-500 dark:text-sky-100 dark:hover:bg-sky-900/30';
            case 'dolor': return 'bg-amber-50 border-amber-500 text-amber-900 hover:bg-amber-100 hover:border-amber-600 dark:bg-amber-900/20 dark:border-amber-500 dark:text-amber-100 dark:hover:bg-amber-900/30';
            case 'sit': return 'bg-violet-50 border-violet-500 text-violet-900 hover:bg-violet-100 hover:border-violet-600 dark:bg-violet-900/20 dark:border-violet-500 dark:text-violet-100 dark:hover:bg-violet-900/30';
            default: return 'bg-slate-50 border-slate-500 text-slate-900 hover:bg-slate-100 hover:border-slate-600 dark:bg-slate-800/50 dark:border-slate-500 dark:text-slate-100 dark:hover:bg-slate-800/70';
        }
    };

    const getTooltipCategoryStyle = (category: string) => {
        switch (category) {
            case 'lorem': return 'border-emerald-500 text-emerald-700 bg-emerald-50';
            case 'ipsum': return 'border-sky-500 text-sky-700 bg-sky-50';
            case 'dolor': return 'border-amber-500 text-amber-700 bg-amber-50';
            case 'sit': return 'border-violet-500 text-violet-700 bg-violet-50';
            default: return 'border-slate-500 text-slate-700 bg-slate-50';
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
                                                getCategoryColor(event.category)
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

                                                <div className="flex items-center gap-2 text-muted-foreground bg-muted/20 p-2 rounded-md">
                                                    <CalendarIcon className="w-4 h-4 text-foreground/70" />
                                                    <span className="font-medium text-foreground/80">{event.start} — {event.end || 'Ongoing'}</span>
                                                </div>

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
        </TooltipProvider>
    );
}
