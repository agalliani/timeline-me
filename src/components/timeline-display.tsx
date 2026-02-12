"use client";

import React, { useMemo } from 'react';
import { Timesheet } from '@/lib/timesheet';
import { TimelineItem } from '@/types/timeline';
import { cn } from '@/lib/utils';

interface TimelineDisplayProps {
    data: TimelineItem[];
    minYear?: number;
    maxYear?: number;
}

export function TimelineDisplay({ data, minYear = 2020, maxYear = 2026 }: TimelineDisplayProps) {

    const { bubbles, years, totalHeight } = useMemo(() => {
        // If no data, use default range
        // Logic: Determine min/max from data if possible, or use props

        // We instantiate Timesheet to let it calculate internal state
        const ts = new Timesheet(minYear, maxYear, data);

        // Get bubbles using default width (59px as per CSS)
        const bubbles = ts.getBubbles(59);
        const years = ts.getYears();

        // Calculate naive height: (bubbles.length + 1) * 35px (approx row height)
        // Legacy CSS: li height 32px + margin 3px = 35px
        const totalHeight = (bubbles.length + 2) * 35; // +2 for buffer

        return { bubbles, years, totalHeight };
    }, [data, minYear, maxYear]);

    if (!data || data.length === 0) {
        return (
            <div className="text-center text-muted-foreground p-10 border border-dashed rounded-lg bg-muted/20">
                No timeline data yet. Add some items to visualize!
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto overflow-y-hidden border rounded-lg bg-[#1c1917] shadow-xl p-4">
            <div className="relative min-w-[800px] pt-6" style={{ height: `${totalHeight}px` }}> {/* Ensure min-width for scroll */}
                <div id="timesheet" className="timesheet color-scheme-default h-full w-full">

                    {/* Scale (Years) */}
                    <div className="scale h-full absolute left-0 top-0 flex">
                        {years.map((year) => (
                            <section key={year} className="h-full border-l border-white/20">
                                {year}
                            </section>
                        ))}
                    </div>

                    {/* Data Bubbles */}
                    <ul className="data relative pt-8 list-none m-0">
                        {bubbles.map((bubble, index) => (
                            <li key={index} className="group hover:opacity-100 h-8 mb-1 block relative clear-both whitespace-nowrap">
                                <span
                                    className={cn(
                                        "bubble block float-left relative top-1.5 rounded h-2.5 mr-2.5 opacity-70 transition-opacity group-hover:opacity-100",
                                        bubble.class // e.g. "bubble-default", "bubble-lorem"
                                    )}
                                    style={{
                                        marginLeft: `${bubble.marginLeft}px`,
                                        width: `${bubble.width}px`
                                    }}
                                    data-duration={bubble.duration}
                                >
                                    <span className="date text-white text-xs mr-1 absolute -top-4 left-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                        {bubble.dateLabel}
                                    </span>
                                    {/* Label is outside the bubble span in legacy CSS structure? No, it was inside. 
                                In legacy CSS: .timesheet .data li .label is inside li but NOT inside .bubble?
                                Let's check logic:
                                Legacy TS: 
                                bubbles.push({ ... dateLabel, label })
                                Template:
                                <li *ngFor...>
                                  <span [style...] class="bubble">
                                     <span class="date">{{ bubble.dateLabel }}</span>
                                     <span class="label">{{ bubble.label }}</span>
                                  </span>
                                </li>
                                Wait, if they are INSIDE the bubble span (which has overflow hidden maybe? No. width is set).
                                If width is small, text might overflow.
                                Legacy CSS: .label { white-space: nowrap; }
                                It seems they are inside.
                             */}
                                    <div className="flex items-center absolute left-full top-[-2px] pl-2 w-max">
                                        <span className="label text-white/90 font-light text-sm leading-none">
                                            {bubble.label}
                                        </span>
                                    </div>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
