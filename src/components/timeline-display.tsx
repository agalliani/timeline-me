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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit2 } from 'lucide-react';

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

    const getBubbleColorClass = (category: string) => {
        const colorName = colorMap[category] || 'slate';
        // Map to strong background for horizontal bubbles
        switch (colorName) {
            case 'red': return 'bg-red-500 text-white hover:bg-red-600';
            case 'orange': return 'bg-orange-500 text-white hover:bg-orange-600';
            case 'amber': return 'bg-amber-500 text-white hover:bg-amber-600';
            case 'yellow': return 'bg-yellow-500 text-white hover:bg-yellow-600';
            case 'lime': return 'bg-lime-500 text-white hover:bg-lime-600';
            case 'green': return 'bg-green-500 text-white hover:bg-green-600';
            case 'emerald': return 'bg-emerald-500 text-white hover:bg-emerald-600';
            case 'teal': return 'bg-teal-500 text-white hover:bg-teal-600';
            case 'cyan': return 'bg-cyan-500 text-white hover:bg-cyan-600';
            case 'sky': return 'bg-sky-500 text-white hover:bg-sky-600';
            case 'blue': return 'bg-blue-500 text-white hover:bg-blue-600';
            case 'indigo': return 'bg-indigo-500 text-white hover:bg-indigo-600';
            case 'violet': return 'bg-violet-500 text-white hover:bg-violet-600';
            case 'purple': return 'bg-purple-500 text-white hover:bg-purple-600';
            case 'fuchsia': return 'bg-fuchsia-500 text-white hover:bg-fuchsia-600';
            case 'pink': return 'bg-pink-500 text-white hover:bg-pink-600';
            case 'rose': return 'bg-rose-500 text-white hover:bg-rose-600';
            default: return 'bg-slate-500 text-white hover:bg-slate-600';
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

    return (
        <TooltipProvider delayDuration={300}>
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
                        <Tooltip key={index}>
                            <TooltipTrigger asChild>
                                <div
                                    onClick={() => onEdit?.(index)}
                                    className={cn(
                                        "relative group rounded h-10 flex items-center px-2 transition-all hover:brightness-110 hover:z-10",
                                        onEdit ? "cursor-pointer hover:ring-2 hover:ring-white/50" : "",
                                        getBubbleColorClass(bubble.type || '')
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
                            </TooltipTrigger>
                            <TooltipContent side="bottom" align="start" className="p-0 border-none bg-transparent shadow-xl z-50">
                                <Card className={cn("w-72 border-t-4", getTooltipCategoryStyle(bubble.type || 'Work').split(' ')[0])}>
                                    <CardHeader className="p-4 pb-2 bg-muted/5">
                                        <CardTitle className="text-base leading-snug">{bubble.label}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-3 text-sm space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Badge variant="outline" className={cn("text-xs uppercase tracking-wide font-medium", getTooltipCategoryStyle(bubble.type || 'Work'))}>
                                                {bubble.type}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground font-mono">
                                                {bubble.dateLabel}
                                            </span>
                                        </div>

                                        {bubble.description && (
                                            <div className="text-muted-foreground bg-muted/10 p-2 rounded-md max-h-[150px] overflow-y-auto text-xs leading-relaxed whitespace-pre-wrap">
                                                {bubble.description}
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
                    ))}
                </div>
            </div>
        </TooltipProvider>
    );
});

TimelineDisplay.displayName = "TimelineDisplay";
