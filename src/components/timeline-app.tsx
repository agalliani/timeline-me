"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toPng } from "html-to-image";
import { TimelineItem } from "@/types/timeline";
import { TimelineDisplay } from "@/components/timeline-display";
// import { TimelineForm } from "@/components/timeline-form"; // Moved to Modal
import { TimelineModal } from "@/components/timeline-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Share2, Download, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export function TimelineApp() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [data, setData] = useState<TimelineItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(null);
    const timelineRef = useRef<HTMLDivElement>(null);

    // Load from URL on mount
    useEffect(() => {
        const dataParam = searchParams.get("data");
        if (dataParam) {
            try {
                // Robust decoding for UTF-8 Support
                const decoded = decodeURIComponent(escape(atob(dataParam)));
                const parsed = JSON.parse(decoded);
                if (Array.isArray(parsed)) {
                    setData(parsed);
                }
            } catch (e) {
                console.error("Failed to parse timeline data from URL", e);
                // Fallback for legacy simple btoa if needed, or just fail safely
                try {
                    const simpleDecoded = atob(dataParam);
                    const parsed = JSON.parse(simpleDecoded);
                    if (Array.isArray(parsed)) {
                        setData(parsed);
                    }
                } catch (e2) {
                    console.error("Fallback parsing failed", e2);
                }
            }
        }
    }, [searchParams]);

    // Update URL when data changes? 
    // Maybe better to only update when user clicks "Share"? 
    // User UC: "User clicks Copy Share Link -> System encodes state".
    // So we don't need to sync URL on every change, only read on load.

    const saveToLocalStorage = (items: TimelineItem[]) => {
        localStorage.setItem("timeline-data", JSON.stringify(items));
    };

    const handleAdd = () => {
        setSelectedEventIndex(null);
        setIsModalOpen(true);
    };

    const handleEdit = (index: number) => {
        setSelectedEventIndex(index);
        setIsModalOpen(true);
    };

    const handleSave = (item: TimelineItem) => {
        const newData = [...data];

        if (selectedEventIndex !== null) {
            // Edit existing
            newData[selectedEventIndex] = item;
        } else {
            // Add new
            newData.push(item);
        }

        // Auto-Sort by Start Date
        newData.sort((a, b) => a.start.localeCompare(b.start));

        setData(newData);
        saveToLocalStorage(newData);
        setIsModalOpen(false);
        toast.success(selectedEventIndex !== null ? "Event updated!" : "Event added!");
    };

    const handleDelete = (index: number) => {
        const newData = data.filter((_, i) => i !== index);
        setData(newData);
        saveToLocalStorage(newData);
        toast.success("Event deleted!");
    };

    // Load from LocalStorage on mount if URL is empty
    useEffect(() => {
        if (!searchParams.get("data")) {
            const saved = localStorage.getItem("timeline-data");
            if (saved) {
                try {
                    setData(JSON.parse(saved));
                } catch (e) {
                    console.error("Failed to parse local storage", e);
                }
            }
        }
    }, [searchParams]);

    const handleShare = () => {
        if (data.length === 0) return;
        try {
            const json = JSON.stringify(data);
            // Robust encoding for UTF-8 (emojis etc)
            const encoded = btoa(unescape(encodeURIComponent(json)));
            const url = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
            navigator.clipboard.writeText(url).then(() => {
                toast.success("Link copied to clipboard!");
            });
        } catch (e) {
            console.error("Failed to share", e);
            toast.error("Failed to generate share link");
        }
    };

    const handleSaveImage = async () => {
        if (!timelineRef.current) return;
        try {
            // Small delay to ensure rendering
            await new Promise(r => setTimeout(r, 100));

            const element = timelineRef.current;
            const dataUrl = await toPng(element, {
                cacheBust: true,
                backgroundColor: "#1c1917",
                width: element.scrollWidth,
                height: element.scrollHeight,
                style: {
                    overflow: 'visible', // Ensure full capture
                    maxHeight: 'none',
                    maxWidth: 'none',
                }
            });

            const link = document.createElement("a");
            link.href = dataUrl;
            link.download = "my-timeline.png";
            link.click();
            toast.success("Timeline image saved!");
        } catch (e) {
            console.error("Failed to save image", e);
            toast.error("Failed to save image");
        }
    };

    return (
        <div className="space-y-8">
            {/* Header / Intro */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                    TiMe!
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Create a beautiful timeline of your life events: career, books, travels, and more.
                </p>
            </div>

            {/* Visualization and Controls */}
            <div className="space-y-4">
                <div className="flex justify-between items-center bg-card/50 backdrop-blur-sm p-4 rounded-lg border shadow-sm">
                    <Button onClick={handleAdd} className="gap-2">
                        <Plus className="h-4 w-4" /> Add Event
                    </Button>

                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleSaveImage} disabled={data.length === 0}>
                            <Download className="mr-2 h-4 w-4" /> Save Image
                        </Button>
                        <Button variant="secondary" size="sm" onClick={handleShare} disabled={data.length === 0}>
                            <Share2 className="mr-2 h-4 w-4" /> Share
                        </Button>
                    </div>
                </div>

                {/* TimelineDisplay handles its own styling and scrolling. We attach ref directly. */}
                {/* @ts-ignore: onEdit not yet in TimelineDisplay props, fixing next */}
                <TimelineDisplay
                    ref={timelineRef}
                    data={data}
                    minYear={data.length > 0 ? undefined : 2020}
                    maxYear={data.length > 0 ? undefined : 2026}
                    onEdit={handleEdit}
                />
            </div>

            <TimelineModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSave}
                initialData={selectedEventIndex !== null ? data[selectedEventIndex] : null}
            />

            {/* List View for easier management */}
            {data.length > 0 && (
                <Card>
                    <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold mb-4">Your Events</h3>
                        <div className="space-y-2">
                            {data.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                                    onClick={() => handleEdit(index)}
                                >
                                    <div>
                                        <span className="font-medium">{item.label}</span>
                                        <span className="text-sm text-muted-foreground ml-2">
                                            ({item.start} {item.end ? `- ${item.end}` : ""})
                                        </span>
                                        <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-capitalize">
                                            {item.category}
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(index);
                                        }}
                                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
