import React, { useMemo, useRef, useState } from 'react';
import { TimelineItem } from '@/types/timeline';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Edit2, ZoomIn, ZoomOut } from 'lucide-react';

interface TimelineVerticalProps {
    data: TimelineItem[];
    className?: string;
    colorMap?: Record<string, string>;
    onEdit?: (index: number) => void;
    readonly?: boolean;
}

// Auto-Color Palette for Columns (Light friendly) - Zinc/Slate based defaults + accents
const AUTO_COLORS = [
    'blue', 'emerald', 'violet', 'amber', 'cyan', 'rose', 'indigo', 'teal'
];

export function TimelineVertical({ data, className, colorMap = {}, onEdit, readonly = false }: TimelineVerticalProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Zoom State: Pixels per Month (Range 1 to 24)
    // Default 6 for balanced view
    const [pixelsPerMonth, setPixelsPerMonth] = useState([6]);
    const currentDensity = pixelsPerMonth[0];

    // Dynamic thresholds
    const isCompactMode = currentDensity < 8;
    const isMicroMode = currentDensity < 4;

    // 1. Parsing & Layout Logic (Memoized)
    const { events, totalHeight, gridLines } = useMemo(() => {
        if (!data || data.length === 0) return { events: [], totalHeight: 0, gridLines: [] };

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
            const duration = Math.max(endVal - startVal, 1);

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
            gridLines: lines
        };

    }, [data, currentDensity]);


    const getColorForEvent = (category: string, colIndex: number): string => {
        // 1. Explicit overwrite from Color Settings
        if (colorMap[category] && colorMap[category] !== 'default') return colorMap[category];

        // 2. Implicit color name in category (case-insensitive)
        const validColors = ['slate', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'];
        if (validColors.includes(category.toLowerCase())) {
            return category.toLowerCase();
        }

        // 3. Auto-cycle
        return AUTO_COLORS[colIndex % AUTO_COLORS.length];
    };

    const getEventStyleClasses = (category: string, colIndex: number) => {
        const color = getColorForEvent(category, colIndex);
        // Updated to use surface-like colors with better contrast/border
        switch (color) {
            case 'slate': return 'bg-white border-zinc-200 text-zinc-800 shadow-xs hover:shadow-md hover:border-zinc-300';
            case 'red': return 'bg-red-50/80 border-red-200 text-red-900 shadow-xs hover:shadow-md hover:border-red-300';
            case 'orange': return 'bg-orange-50/80 border-orange-200 text-orange-900 shadow-xs hover:shadow-md hover:border-orange-300';
            case 'amber': return 'bg-amber-50/80 border-amber-200 text-amber-900 shadow-xs hover:shadow-md hover:border-amber-300';
            case 'yellow': return 'bg-yellow-50/80 border-yellow-200 text-yellow-900 shadow-xs hover:shadow-md hover:border-yellow-300';
            case 'lime': return 'bg-lime-50/80 border-lime-200 text-lime-900 shadow-xs hover:shadow-md hover:border-lime-300';
            case 'green': return 'bg-green-50/80 border-green-200 text-green-900 shadow-xs hover:shadow-md hover:border-green-300';
            case 'emerald': return 'bg-emerald-50/80 border-emerald-200 text-emerald-900 shadow-xs hover:shadow-md hover:border-emerald-300';
            case 'teal': return 'bg-teal-50/80 border-teal-200 text-teal-900 shadow-xs hover:shadow-md hover:border-teal-300';
            case 'cyan': return 'bg-cyan-50/80 border-cyan-200 text-cyan-900 shadow-xs hover:shadow-md hover:border-cyan-300';
            case 'sky': return 'bg-sky-50/80 border-sky-200 text-sky-900 shadow-xs hover:shadow-md hover:border-sky-300';
            case 'blue': return 'bg-blue-50/80 border-blue-200 text-blue-900 shadow-xs hover:shadow-md hover:border-blue-300';
            case 'indigo': return 'bg-indigo-50/80 border-indigo-200 text-indigo-900 shadow-xs hover:shadow-md hover:border-indigo-300';
            case 'violet': return 'bg-violet-50/80 border-violet-200 text-violet-900 shadow-xs hover:shadow-md hover:border-violet-300';
            case 'purple': return 'bg-purple-50/80 border-purple-200 text-purple-900 shadow-xs hover:shadow-md hover:border-purple-300';
            case 'fuchsia': return 'bg-fuchsia-50/80 border-fuchsia-200 text-fuchsia-900 shadow-xs hover:shadow-md hover:border-fuchsia-300';
            case 'pink': return 'bg-pink-50/80 border-pink-200 text-pink-900 shadow-xs hover:shadow-md hover:border-pink-300';
            case 'rose': return 'bg-rose-50/80 border-rose-200 text-rose-900 shadow-xs hover:shadow-md hover:border-rose-300';
            default: return 'bg-white border-zinc-200 text-zinc-900 shadow-xs hover:shadow-md hover:border-zinc-300';
        }
    }

    const getTooltipDecorations = (category: string, colIndex: number) => {
        const color = getColorForEvent(category, colIndex);
        // Returns classes for the colored strip and badge
        switch (color) {
            case 'slate': return { strip: 'bg-zinc-500', badge: 'text-zinc-700 border-zinc-200 bg-zinc-50' };
            case 'red': return { strip: 'bg-red-500', badge: 'text-red-700 border-red-200 bg-red-50' };
            case 'orange': return { strip: 'bg-orange-500', badge: 'text-orange-700 border-orange-200 bg-orange-50' };
            case 'amber': return { strip: 'bg-amber-500', badge: 'text-amber-700 border-amber-200 bg-amber-50' };
            case 'yellow': return { strip: 'bg-yellow-500', badge: 'text-yellow-700 border-yellow-200 bg-yellow-50' };
            case 'lime': return { strip: 'bg-lime-500', badge: 'text-lime-700 border-lime-200 bg-lime-50' };
            case 'green': return { strip: 'bg-green-500', badge: 'text-green-700 border-green-200 bg-green-50' };
            case 'emerald': return { strip: 'bg-emerald-500', badge: 'text-emerald-700 border-emerald-200 bg-emerald-50' };
            case 'teal': return { strip: 'bg-teal-500', badge: 'text-teal-700 border-teal-200 bg-teal-50' };
            case 'cyan': return { strip: 'bg-cyan-500', badge: 'text-cyan-700 border-cyan-200 bg-cyan-50' };
            case 'sky': return { strip: 'bg-sky-500', badge: 'text-sky-700 border-sky-200 bg-sky-50' };
            case 'blue': return { strip: 'bg-blue-500', badge: 'text-blue-700 border-blue-200 bg-blue-50' };
            case 'indigo': return { strip: 'bg-indigo-500', badge: 'text-indigo-700 border-indigo-200 bg-indigo-50' };
            case 'violet': return { strip: 'bg-violet-500', badge: 'text-violet-700 border-violet-200 bg-violet-50' };
            case 'purple': return { strip: 'bg-purple-500', badge: 'text-purple-700 border-purple-200 bg-purple-50' };
            case 'fuchsia': return { strip: 'bg-fuchsia-500', badge: 'text-fuchsia-700 border-fuchsia-200 bg-fuchsia-50' };
            case 'pink': return { strip: 'bg-pink-500', badge: 'text-pink-700 border-pink-200 bg-pink-50' };
            case 'rose': return { strip: 'bg-rose-500', badge: 'text-rose-700 border-rose-200 bg-rose-50' };
            default: return { strip: 'bg-zinc-500', badge: 'text-zinc-700 border-zinc-200 bg-zinc-50' };
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
                    <div className="sticky top-20 z-40 bg-white/90 backdrop-blur-md border border-zinc-200 p-2 rounded-lg flex items-center gap-4 shadow-sm w-fit mx-auto lg:mx-0 transition-all hover:shadow-md">
                        <span className="text-[10px] items-center gap-1.5 uppercase tracking-wider font-mono text-muted-foreground hidden sm:flex pl-2">
                            <ZoomOut className="w-3 h-3" />
                        </span>
                        <Slider
                            value={pixelsPerMonth}
                            min={1}
                            max={24}
                            step={1}
                            onValueChange={setPixelsPerMonth}
                            className="w-32 md:w-48"
                        />
                        <span className="text-[10px] items-center gap-1.5 uppercase tracking-wider font-mono text-muted-foreground hidden sm:flex">
                            <ZoomIn className="w-3 h-3 text-muted-foreground" />
                        </span>
                        <div className="w-px h-4 bg-zinc-200 mx-1" />
                        <span className="text-xs font-mono text-zinc-500 min-w-[3.5rem] text-center">
                            {(currentDensity * 12).toFixed(0)} <span className="text-[9px] text-zinc-400">px/yr</span>
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
                                    line.type === 'year'
                                        ? "border-t border-zinc-200/80"
                                        : "border-t border-dashed border-zinc-100"
                                )}
                                style={{ top: line.top }}
                            >
                                <span className={cn(
                                    "pl-2 font-mono select-none",
                                    line.type === 'year'
                                        ? "text-xs font-bold text-zinc-900 -mt-5 bg-white/80 backdrop-blur-[1px] px-1 rounded shadow-sm border border-zinc-100 ml-2"
                                        : "text-[9px] text-zinc-300 -mt-3.5 pl-6"
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
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.4, delay: i * 0.02, type: "spring", stiffness: 100 }}
                                            className={cn(
                                                "absolute rounded border-l-[3px] overflow-hidden cursor-pointer transition-all hover:z-10",
                                                getEventStyleClasses(event.category, event.colIndex),
                                                isMicroMode ? "opacity-90 hover:opacity-100" : ""
                                            )}
                                            style={{
                                                top: event.top,
                                                height: event.height - 3, // slightly more gap
                                                left: `${(event.colIndex / event.totalColumns) * 100}%`,
                                                width: `${(1 / event.totalColumns) * 100}%`,
                                                maxWidth: '99%', // prevent full overlap touching
                                                marginRight: '1px' // create tiny gap between columns
                                            }}
                                            onClick={() => !readonly && onEdit?.(event.originalIndex)}
                                        >
                                            {!isMicroMode && (
                                                <div className="px-2 py-1 h-full">
                                                    <div className={cn(
                                                        "font-semibold truncate",
                                                        isCompactMode ? "text-[10px] leading-tight" : "text-xs md:text-sm"
                                                    )}>
                                                        {event.label}
                                                    </div>

                                                    {!isCompactMode && (
                                                        <div className="text-[10px] opacity-70 truncate mt-0.5 font-mono">
                                                            {event.start} — {event.end || 'Now'}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </motion.div>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" sideOffset={10} className="bg-transparent border-none p-0 shadow-none z-50">
                                        <div className="w-72 rounded-xl border border-zinc-200 bg-white shadow-2xl overflow-hidden relative animation-in fade-in-0 zoom-in-95 duration-200">
                                            {/* Colored Strip */}
                                            <div className={cn("w-1.5 h-full absolute left-0 top-0", decor.strip)} />

                                            <div className="p-5 pl-6">
                                                <h4 className="font-bold text-zinc-900 text-lg leading-tight tracking-tight">{event.label}</h4>
                                                <div className="flex items-center gap-2 mt-3 mb-4">
                                                    <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 font-medium bg-transparent", decor.badge)}>
                                                        {event.category.toUpperCase()}
                                                    </Badge>
                                                    <span className="text-[11px] font-mono text-zinc-500">{event.start} — {event.end || 'Present'}</span>
                                                </div>
                                                {event.description && (
                                                    <div className="text-sm text-zinc-600 leading-relaxed max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                                        {event.description}
                                                    </div>
                                                )}
                                                {!readonly && (
                                                    <div className="mt-5 pt-3 border-t border-zinc-100 text-[10px] text-zinc-400 flex items-center gap-1.5 uppercase tracking-wider font-semibold hover:text-zinc-600 transition-colors">
                                                        <Edit2 className="w-3 h-3" /> Click to Edit
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
