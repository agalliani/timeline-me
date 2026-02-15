"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TimelineVertical } from "@/components/timeline-vertical";
import { TimelineDisplay } from "@/components/timeline-display";
import { TimelineItem } from "@/types/timeline";
import { decodeTimelineData } from "@/lib/url-utils";
import { TimelineSkeleton } from "@/components/timeline-skeleton";

function EmbedContent() {
    const searchParams = useSearchParams();
    const [data, setData] = useState<TimelineItem[]>([]);
    const [colorMap, setColorMap] = useState<Record<string, string>>({});
    const [viewMode, setViewMode] = useState<'vertical' | 'horizontal'>('vertical');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const dataParam = searchParams.get("data");
        const viewParam = searchParams.get("view");

        if (viewParam === 'horizontal') {
            setViewMode('horizontal');
        }

        if (dataParam) {
            const decoded = decodeTimelineData(dataParam);
            if (decoded) {
                setData(decoded.data);
                setColorMap(decoded.colorMap);
            }
        }
        setLoading(false);
    }, [searchParams]);

    if (loading) {
        return <TimelineSkeleton />;
    }

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4 text-muted-foreground text-sm">
                No timeline data found.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent p-4">
            {viewMode === 'vertical' ? (
                <TimelineVertical
                    data={data}
                    colorMap={colorMap}
                    readonly={true}
                />
            ) : (
                <TimelineDisplay
                    data={data}
                    colorMap={colorMap}
                    readonly={true}
                />
            )}
        </div>
    );
}

export default function EmbedPage() {
    return (
        <Suspense fallback={<TimelineSkeleton />}>
            <EmbedContent />
        </Suspense>
    );
}
