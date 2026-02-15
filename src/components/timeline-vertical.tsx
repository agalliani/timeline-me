import React, { useMemo, useRef, useState, useEffect } from 'react';
import { TimelineItem } from '@/types/timeline';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { CalendarIcon, Edit2, ZoomIn, ZoomOut } from 'lucide-react';

interface TimelineVerticalProps {
    data: TimelineItem[];
    className?: string;
    colorMap?: Record<string, string>;
    onEdit?: (index: number) => void;
    readonly?: boolean;
}

// Auto-Color Palette for Columns (Light friendly)
const AUTO_COLORS = [
    'blue', 'emerald', 'violet', 'amber', 'cyan', 'rose', 'indigo', 'teal'
];

export function TimelineVertical({ data, className, colorMap = {}, onEdit, readonly = false }: TimelineVerticalProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // ... (rest of logic) ...

    // Zoom State: Pixels per Month (Range 1 to 24)
    // Default 6 for balanced view
    const [pixelsPerMonth, setPixelsPerMonth] = useState([6]);
    const currentDensity = pixelsPerMonth[0];

    // Dynamic thresholds
    const isCompactMode = currentDensity < 8;
    const isMicroMode = currentDensity < 4;

    // 1. Parsing & Layout Logic (Memoized)
    const { events, totalHeight, minDateValue, gridLines } = useMemo(() => {
        if (!data || data.length === 0) return { events: [], totalHeight: 0, minDateValue: 0, gridLines: [] };

        const getMonthValue = (dateStr: string | null) => {
            if (!dateStr) return 0;
            let year = 0, month = 0;
            if (dateStr.includes('-')) {
                const parts = dateStr.split('-');
                year = parseInt(parts[0]);
                month = parts[1] ? parseInt(parts[1]) - 1 : 0;
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
            // If end is missing, treat as "Now" (current month)
            const currentMonthVal = (new Date().getFullYear() * 12) + new Date().getMonth();
            const endVal = item.end ? getMonthValue(item.end) : currentMonthVal;
            // Min duration 1 month for visibility
            let duration = Math.max(endVal - startVal, 1);

            return {
                ...item,
                originalIndex: index,
                startVal,
                endVal: Math.max(endVal, startVal),
                duration
            };
        });

        if (parsedEvents.length === 0) return { events: [], totalHeight: 0, minDateValue: 0, gridLines: [] };

        // Bounds
        let minVal = Math.min(...parsedEvents.map(e => e.startVal));
        let maxVal = Math.max(...parsedEvents.map(e => e.endVal));

        minVal -= 6;
        maxVal += 6;

        const totalMonths = maxVal - minVal;
        const totalPx = totalMonths * currentDensity;

        // --- Column Packing (Multi-track) ---
        parsedEvents.sort((a, b) => a.startVal - b.startVal || (b.endVal - a.endVal));

        const columns: { endVal: number }[] = [];
        const positionedEvents = parsedEvents.map(event => {
            let colIndex = -1;
            for (let i = 0; i < columns.length; i++) {
                if (columns[i].endVal <= event.startVal) {
                    colIndex = i;
                    columns[i].endVal = event.endVal;
                    break;
                }
            }
            if (colIndex === -1) {
                colIndex = columns.length;
                columns.push({ endVal: event.endVal });
            }

            return {
                ...event,
                colIndex,
                top: (event.startVal - minVal) * currentDensity,
                height: Math.max(event.duration * currentDensity, currentDensity),
            };
        });

        const maxColumns = Math.max(columns.length, 1);

        // --- Grid Generation ---
        const lines = [];
        const startYear = Math.floor(minVal / 12);

        const totalYearsCovered = Math.ceil(totalMonths / 12) + 1;

        for (let y = 0; y < totalYearsCovered; y++) {
            const year = startYear + y;
            const monthVal = year * 12;

            if (monthVal >= minVal && monthVal <= maxVal + 12) {
                const top = (monthVal - minVal) * currentDensity;
                lines.push({ top, label: year.toString(), type: 'year' });

                if (currentDensity > 8) {
                    for (let q = 1; q < 4; q++) {
                        lines.push({
                            top: top + (q * 3 * currentDensity),
                            label: `Q${q + 1}`,
                            type: 'quarter'
                        });
                    }
                }
            }
        }

        return {
            events: positionedEvents.map(e => ({ ...e, totalColumns: maxColumns })),
            totalHeight: totalPx,
            minDateValue: minVal,
            gridLines: lines
        };

    }, [data, currentDensity]);


    const getColorForEvent = (category: string, colIndex: number): string => {
        if (colorMap[category] && colorMap[category] !== 'default') return colorMap[category];
        return AUTO_COLORS[colIndex % AUTO_COLORS.length];
    };

    const getEventStyleClasses = (category: string, colIndex: number) => {
        const color = getColorForEvent(category, colIndex);
        switch (color) {
            case 'red': return 'bg-red-50/50 border-red-500 text-red-900 hover:bg-red-100/50';
            case 'blue': return 'bg-blue-50/50 border-blue-500 text-blue-900 hover:bg-blue-100/50';
            case 'green': return 'bg-emerald-50/50 border-emerald-500 text-emerald-900 hover:bg-emerald-100/50';
            case 'amber': return 'bg-amber-50/50 border-amber-500 text-amber-900 hover:bg-amber-100/50';
            case 'purple': return 'bg-purple-50/50 border-purple-500 text-purple-900 hover:bg-purple-100/50';
            case 'cyan': return 'bg-cyan-50/50 border-cyan-500 text-cyan-900 hover:bg-cyan-100/50';
            case 'rose': return 'bg-rose-50/50 border-rose-500 text-rose-900 hover:bg-rose-100/50';
            default: return 'bg-slate-50/50 border-slate-500 text-slate-900 hover:bg-slate-100/50';
        }
    }

    const getTooltipDecorations = (category: string, colIndex: number) => {
        const color = getColorForEvent(category, colIndex);
        // Returns classes for the colored strip and badge
        switch (color) {
            case 'red': return { strip: 'bg-red-500', badge: 'text-red-700 border-red-200 bg-red-50' };
            case 'blue': return { strip: 'bg-blue-500', badge: 'text-blue-700 border-blue-200 bg-blue-50' };
            case 'green': return { strip: 'bg-emerald-500', badge: 'text-emerald-700 border-emerald-200 bg-emerald-50' };
            case 'amber': return { strip: 'bg-amber-500', badge: 'text-amber-700 border-amber-200 bg-amber-50' };
            case 'purple': return { strip: 'bg-purple-500', badge: 'text-purple-700 border-purple-200 bg-purple-50' };
            case 'cyan': return { strip: 'bg-cyan-500', badge: 'text-cyan-700 border-cyan-200 bg-cyan-50' };
            case 'rose': return { strip: 'bg-rose-500', badge: 'text-rose-700 border-rose-200 bg-rose-50' };
            default: return { strip: 'bg-slate-500', badge: 'text-slate-700 border-slate-200 bg-slate-50' };
        }
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed border-zinc-200 rounded-xl bg-zinc-50">
                <p className="text-muted-foreground">Timeline is empty.</p>
            </div>
        );
    }

    return (
        <TooltipProvider delayDuration={0}>
            <div className={cn("flex flex-col space-y-4", className)}>

                {/* Control Bar (Hidden in Readonly) */}
                {!readonly && (
                    <div className="sticky top-4 z-40 bg-white/80 backdrop-blur-md border border-zinc-200 p-2 rounded-lg flex items-center gap-4 shadow-sm w-fit mx-auto lg:mx-0">
                        <span className="text-[10px] items-center gap-1.5 uppercase tracking-wider font-mono text-muted-foreground hidden sm:flex">
                            <ZoomOut className="w-3 h-3" /> Density
                        </span>
                        <Slider
                            value={pixelsPerMonth}
                            min={1}
                            max={24}
                            step={1}
                            onValueChange={setPixelsPerMonth}
                            className="w-32 md:w-48"
                        />
                        <ZoomIn className="w-3 h-3 text-muted-foreground" />
                        <div className="w-px h-4 bg-zinc-200 mx-2" />
                        <span className="text-xs font-mono text-muted-foreground min-w-[3rem]">
                            {(currentDensity * 12).toFixed(0)}px/yr
                        </span>
                    </div>
                )}

                {/* Timeline Container */}
                <div
                    ref={containerRef}
                    className="relative w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 min-h-[500px]"
                    style={{ height: Math.max(totalHeight, 500) }}
                >
                    {/* Grid Background */}
                    <div className="absolute inset-0 pointer-events-none">
                        {gridLines.map((line, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "absolute w-full flex items-center transition-all duration-300",
                                    line.type === 'year' ? "border-t border-black/10" : "border-t border-black/5"
                                )}
                                style={{ top: line.top }}
                            >
                                <span className={cn(
                                    "pl-2 font-mono select-none",
                                    line.type === 'year'
                                        ? "text-xs font-bold text-zinc-900 -mt-5 bg-white/50 px-1 rounded"
                                        : "text-[9px] text-zinc-400 -mt-3.5 pl-6"
                                )}>
                                    {line.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Events Layer */}
                    <div className="absolute top-0 bottom-0 right-4 left-16 md:left-20">
                        {events.map((event, i) => {
                            const decor = getTooltipDecorations(event.category, event.colIndex);
                            return (
                                <Tooltip key={i}>
                                    <TooltipTrigger asChild>
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.3, delay: i * 0.02 }}
                                            className={cn(
                                                "absolute rounded-sm border-l-2 md:border-l-4 overflow-hidden cursor-pointer backdrop-blur-sm transition-colors",
                                                getEventStyleClasses(event.category, event.colIndex),
                                                isMicroMode ? "opacity-80 hover:opacity-100" : ""
                                            )}
                                            style={{
                                                top: event.top,
                                                height: event.height - 2,
                                                left: `${(event.colIndex / event.totalColumns) * 100}%`,
                                                width: `${(1 / event.totalColumns) * 100}%`,
                                                maxWidth: '98%',
                                                marginRight: '2px'
                                            }}
                                            onClick={() => !readonly && onEdit?.(event.originalIndex)}
                                        >
                                            {!isMicroMode && (
                                                <div className="px-2 py-1 h-full">
                                                    <div className={cn(
                                                        "font-semibold truncate text-zinc-900",
                                                        isCompactMode ? "text-[10px] leading-tight" : "text-xs md:text-sm"
                                                    )}>
                                                        {event.label}
                                                    </div>

                                                    {!isCompactMode && (
                                                        <div className="text-[10px] text-zinc-500 truncate mt-0.5 font-mono">
                                                            {event.start} — {event.end || 'Now'}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </motion.div>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="bg-transparent border-none p-0 shadow-none z-50">
                                        <div className="w-72 rounded-lg border border-zinc-200 bg-white shadow-xl overflow-hidden relative">
                                            {/* Colored Strip */}
                                            <div className={cn("w-1 h-full absolute left-0 top-0", decor.strip)} />

                                            <div className="p-4 pl-5">
                                                <h4 className="font-bold text-zinc-900 text-base">{event.label}</h4>
                                                <div className="flex items-center gap-2 mt-2 mb-3">
                                                    <Badge variant="outline" className={cn("text-[10px] bg-transparent", decor.badge)}>
                                                        {event.category}
                                                    </Badge>
                                                    <span className="text-[10px] font-mono text-zinc-500">{event.start} - {event.end || 'Present'}</span>
                                                </div>
                                                {event.description && (
                                                    <div className="text-xs text-zinc-600 leading-relaxed max-h-40 overflow-y-auto pr-1">
                                                        {event.description}
                                                    </div>
                                                )}
                                                {!readonly && (
                                                    <div className="mt-4 pt-2 border-t border-zinc-100 text-[10px] text-zinc-400 flex items-center gap-1.5 uppercase tracking-wider font-medium">
                                                        <Edit2 className="w-3 h-3" /> Edit Event
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            )
                        })}
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
