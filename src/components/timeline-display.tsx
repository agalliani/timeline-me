import React, { useMemo, forwardRef } from 'react';
import { Timesheet } from '@/lib/timesheet';
import { TimelineItem } from '@/types/timeline';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';
import { Edit2, CalendarIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface TimelineDisplayProps {
    data: TimelineItem[];
    minYear?: number;
    maxYear?: number;
    className?: string;
    colorMap?: Record<string, string>;
    onEdit?: (index: number) => void;
}

export const TimelineDisplay = forwardRef<HTMLDivElement, TimelineDisplayProps>(({ data, minYear = 2020, maxYear = 2026, className, colorMap = {}, onEdit }, ref) => {

    const { bubbles, years, totalMonths, minYear: derivedMin } = useMemo(() => {
        // Auto-detect range if not provided or reasonable
        if (data.length > 0) {
            const startYears = data.map(d => parseInt(d.start.split(/[-/]/)[0]));
            const endYears = data.map(d => d.end ? parseInt(d.end.split(/[-/]/)[0]) : new Date().getFullYear());
            minYear = Math.min(...startYears);
            maxYear = Math.max(...endYears) + 1;
        }

        const ts = new Timesheet(minYear, maxYear, data);
        return {
            bubbles: ts.getGridBubbles(),
            years: ts.getYears(),
            totalMonths: ts.getTotalMonths(),
            minYear: ts.year.min
        };
    }, [data, minYear, maxYear]);

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed border-white/10 rounded-xl bg-white/5">
                <p className="text-muted-foreground">Timeline is empty.</p>
            </div>
        );
    }

    // Grid configuration
    const COL_WIDTH = "minmax(40px, 1fr)";

    const getBubbleStyle = (category: string) => {
        const colorName = colorMap[category] || 'slate';
        switch (colorName) {
            case 'red': return 'bg-red-50/50 border-red-500 text-red-900 hover:bg-red-100/50';
            case 'blue': return 'bg-blue-50/50 border-blue-500 text-blue-900 hover:bg-blue-100/50';
            case 'green': return 'bg-emerald-50/50 border-emerald-500 text-emerald-900 hover:bg-emerald-100/50';
            case 'amber': return 'bg-amber-50/50 border-amber-500 text-amber-900 hover:bg-amber-100/50';
            case 'purple': return 'bg-purple-50/50 border-purple-500 text-purple-900 hover:bg-purple-100/50';
            case 'cyan': return 'bg-cyan-50/50 border-cyan-500 text-cyan-900 hover:bg-cyan-100/50';
            case 'rose': return 'bg-rose-50/50 border-rose-500 text-rose-900 hover:bg-rose-100/50';
            default: return 'bg-slate-50/50 border-slate-500 text-slate-900 hover:bg-slate-100/50';
        }
    };

    const getTooltipDecorations = (category: string) => {
        const colorName = colorMap[category] || 'slate';
        switch (colorName) {
            case 'red': return { strip: 'bg-red-500', badge: 'text-red-700 border-red-200 bg-red-50' };
            case 'blue': return { strip: 'bg-blue-500', badge: 'text-blue-700 border-blue-200 bg-blue-50' };
            case 'green': return { strip: 'bg-emerald-500', badge: 'text-emerald-700 border-emerald-200 bg-emerald-50' };
            case 'amber': return { strip: 'bg-amber-500', badge: 'text-amber-700 border-amber-200 bg-amber-50' };
            case 'purple': return { strip: 'bg-purple-500', badge: 'text-purple-700 border-purple-200 bg-purple-50' };
            case 'cyan': return { strip: 'bg-cyan-500', badge: 'text-cyan-700 border-cyan-200 bg-cyan-50' };
            case 'rose': return { strip: 'bg-rose-500', badge: 'text-rose-700 border-rose-200 bg-rose-50' };
            default: return { strip: 'bg-slate-500', badge: 'text-slate-700 border-slate-200 bg-slate-50' };
        }
    };

    return (
        <TooltipProvider delayDuration={0}>
            <div ref={ref} className="w-full overflow-x-auto rounded-xl p-6 custom-scrollbar">
                <div
                    className="grid gap-y-3 relative min-w-max"
                    style={{
                        gridTemplateColumns: `repeat(${totalMonths}, ${COL_WIDTH})`,
                        gridAutoFlow: "row dense",
                    }}
                >
                    {/* Background Grid Lines (Years) */}
                    {years.map((year, i) => {
                        const colStart = (year - derivedMin) * 12 + 1;
                        return (
                        return (
                            <div
                                key={year}
                                className="border-l border-zinc-200 pl-2 pb-4 sticky top-0 z-10 pointer-events-none"
                                style={{
                                    gridColumnStart: colStart,
                                    gridColumnEnd: `span 12`,
                                    gridRow: '1 / -1', // Span all rows
                                }}
                            >
                                <span className="text-zinc-400 text-xs font-bold font-mono bg-white px-1 rounded">
                                    {year}
                                </span>
                            </div>
                        );
                    })}

                    {/* Spacer for Year Labels */}
                    <div className="h-6 w-full col-span-full" />

                    {/* Timeline Events */}
                    {bubbles.map((bubble, index) => {
                        const decor = getTooltipDecorations(bubble.type || 'Work');

                        return (
                            <Tooltip key={index}>
                                <TooltipTrigger asChild>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => onEdit?.(index)}
                                        className={cn(
                                            "relative group rounded border-l-2 flex flex-col justify-center px-2 py-1 transition-all hover:scale-[1.01] hover:brightness-110 hover:z-20 cursor-pointer h-14 shadow-sm",
                                            getBubbleStyle(bubble.type || '')
                                        )}
                                        style={{
                                            gridColumnStart: bubble.gridColumnStart,
                                            gridColumnEnd: `span ${bubble.gridColumnSpan}`,
                                        }}
                                    >
                                        <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono leading-none mb-1">
                                            {bubble.dateLabel}
                                        </div>
                                        <div className="text-xs md:text-sm font-semibold text-zinc-900 truncate leading-tight">
                                            {bubble.label}
                                        </div>
                                    </motion.div>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" align="start" className="bg-transparent border-none p-0 shadow-none z-50">
                                    <div className="w-72 rounded-lg border border-zinc-200 bg-white shadow-xl overflow-hidden relative">
                                        <div className={cn("w-1 h-full absolute left-0 top-0", decor.strip)} />
                                        <div className="p-4 pl-5">
                                            <h4 className="font-bold text-zinc-900 text-base leading-snug">{bubble.label}</h4>

                                            <div className="flex items-center gap-2 mt-2 mb-3">
                                                <Badge variant="outline" className={cn("text-[10px] bg-transparent", decor.badge)}>
                                                    {bubble.type}
                                                </Badge>
                                                <span className="text-[10px] font-mono text-zinc-500">{bubble.dateLabel}</span>
                                            </div>

                                            {bubble.description && (
                                                <div className="text-xs text-zinc-600 leading-relaxed max-h-40 overflow-y-auto pr-1">
                                                    {bubble.description}
                                                </div>
                                            )}

                                            <div className="mt-4 pt-2 border-t border-zinc-100 text-[10px] text-zinc-400 flex items-center gap-1.5 uppercase tracking-wider font-medium">
                                                <Edit2 className="w-3 h-3" /> Edit Event
                                            </div>
                                        </div>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        )
                    })}
                </div>
            </div>
        </TooltipProvider>
    );
});

TimelineDisplay.displayName = "TimelineDisplay";
