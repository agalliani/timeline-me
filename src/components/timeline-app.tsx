"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toPng } from "html-to-image";
import { TimelineItem } from "@/types/timeline";
import { TimelineDisplay } from "@/components/timeline-display";
import { TimelineVertical } from "@/components/timeline-vertical";
// import { TimelineForm } from "@/components/timeline-form"; // Moved to Modal
import { TimelineModal } from "@/components/timeline-modal";
import { LinkedInImportModal } from "@/components/linkedin-import-modal";
import { ColorSettingsModal } from "@/components/color-settings-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Share2, Download, Trash2, Plus, Upload, Palette } from "lucide-react";
import { toast } from "sonner";

export function TimelineApp() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [data, setData] = useState<TimelineItem[]>([]);
    const [colorMap, setColorMap] = useState<Record<string, string>>({});

    const [viewMode, setViewMode] = useState<'vertical' | 'horizontal'>('vertical');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isColorModalOpen, setIsColorModalOpen] = useState(false);
    const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(null);
    const timelineRef = useRef<HTMLDivElement>(null);

    // Load from URL and LocalStorage on mount
    useEffect(() => {
        // Load Data from URL or Fallback
        const dataParam = searchParams.get("data");
        if (dataParam) {
            try {
                // Robust decoding for UTF-8 Support
                const decoded = decodeURIComponent(escape(atob(dataParam)));
                const parsed = JSON.parse(decoded);
                if (Array.isArray(parsed)) setData(parsed);
            } catch (e) {
                console.error("Failed to parse timeline data from URL", e);
            }
        } else {
            // Load from LocalStorage if no URL param
            const saved = localStorage.getItem("timeline-data");
            if (saved) {
                try {
                    setData(JSON.parse(saved));
                } catch (e) {
                    console.error("Failed to parse local storage", e);
                }
            }
        }

        // Load Color Map from LocalStorage
        const savedColors = localStorage.getItem("timeline-colors");
        if (savedColors) {
            try {
                setColorMap(JSON.parse(savedColors));
            } catch (e) {
                console.error("Failed to parse saved colors", e);
            }
        }
    }, [searchParams]);

    const saveToLocalStorage = (items: TimelineItem[]) => {
        localStorage.setItem("timeline-data", JSON.stringify(items));
    };

    const saveColors = (newMap: Record<string, string>) => {
        setColorMap(newMap);
        localStorage.setItem("timeline-colors", JSON.stringify(newMap));
        toast.success("Color settings saved!");
    };

    const handleAdd = () => {
        setSelectedEventIndex(null);
        setIsImportModalOpen(false); // Close other modals
        setIsColorModalOpen(false);
        setIsModalOpen(true);
    };

    const handleEdit = (index: number) => {
        setSelectedEventIndex(index);
        setIsImportModalOpen(false); // Close other modals
        setIsColorModalOpen(false);
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

    const handleImport = (items: TimelineItem[]) => {
        // Merge strategy: Append and Sort
        const newData = [...data, ...items].sort((a, b) => a.start.localeCompare(b.start));
        setData(newData);
        saveToLocalStorage(newData);
        setIsImportModalOpen(false);
        toast.success(`Imported ${items.length} events from LinkedIn!`);
    };

    const handleClear = () => {
        if (confirm("Are you sure you want to clear all timeline data?")) {
            setData([]);
            saveToLocalStorage([]);
            toast.success("Timeline cleared!");
        }
    };

    const handleShare = () => {
        const json = JSON.stringify(data);
        const encoded = btoa(unescape(encodeURIComponent(json)));
        const url = `${window.location.origin}${window.location.pathname}?data=${encoded}`;

        navigator.clipboard.writeText(url);
        toast.success("Share link copied to clipboard!");
    };

    const handleScreenshot = async () => {
        if (timelineRef.current) {
            try {
                // Small delay to ensure rendering
                await new Promise(r => setTimeout(r, 100));

                const dataUrl = await toPng(timelineRef.current, {
                    cacheBust: true,
                    backgroundColor: '#1c1917', // Dark background for consistency
                    width: timelineRef.current.scrollWidth,
                    height: timelineRef.current.scrollHeight,
                    style: {
                        overflow: 'visible',
                        maxHeight: 'none',
                        maxWidth: 'none',
                    }
                });
                const link = document.createElement('a');
                link.download = 'my-timeline.png';
                link.href = dataUrl;
                link.click();
                toast.success("Timeline image downloaded!");
            } catch (err) {
                console.error(err);
                toast.error("Failed to generate image.");
            }
        }
    };

    // Extract unique categories for settings
    const uniqueCategories = Array.from(new Set(data.map(d => d.category || "Uncategorized"))).sort();

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6">
            {/* Toolbar */}
            <Card className="bg-background/60 backdrop-blur-xl border-white/20 shadow-sm sticky top-4 z-50">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                        <Button onClick={() => setViewMode('vertical')} variant={viewMode === 'vertical' ? 'default' : 'outline'} size="sm">
                            Vertical
                        </Button>
                        <Button onClick={() => setViewMode('horizontal')} variant={viewMode === 'horizontal' ? 'default' : 'outline'} size="sm">
                            Horizontal
                        </Button>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto flex-wrap justify-end">
                        <Button onClick={() => { setIsModalOpen(false); setIsImportModalOpen(false); setIsColorModalOpen(true); }} variant="outline" size="sm" className="gap-2">
                            <Palette className="w-4 h-4" /> Colors
                        </Button>
                        <Button onClick={() => { setIsModalOpen(false); setIsColorModalOpen(false); setIsImportModalOpen(true); }} variant="outline" size="sm" className="gap-2">
                            <Upload className="w-4 h-4" /> Import LinkedIn
                        </Button>
                        <Button onClick={handleAdd} size="sm" className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-md">
                            <Plus className="w-4 h-4" /> Add Event
                        </Button>
                        <Button onClick={handleShare} variant="secondary" size="icon" title="Share URL">
                            <Share2 className="w-4 h-4" />
                        </Button>
                        <Button onClick={handleScreenshot} variant="secondary" size="icon" title="Download Image">
                            <Download className="w-4 h-4" />
                        </Button>
                        <Button onClick={handleClear} variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" title="Clear All">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content */}
            <div ref={timelineRef} className="p-1 rounded-xl transition-all duration-300">
                {viewMode === 'vertical' ? (
                    <TimelineVertical
                        data={data}
                        colorMap={colorMap}
                        onEdit={handleEdit}
                    />
                ) : (
                    <TimelineDisplay
                        data={data}
                        colorMap={colorMap}
                        onEdit={handleEdit}
                    />
                )}
            </div>

            <TimelineModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={selectedEventIndex !== null ? data[selectedEventIndex] : undefined}
                onDelete={selectedEventIndex !== null ? () => handleDelete(selectedEventIndex!) : undefined}
            />

            <LinkedInImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={handleImport}
            />

            <ColorSettingsModal
                isOpen={isColorModalOpen}
                onClose={() => setIsColorModalOpen(false)}
                categories={uniqueCategories}
                colorMap={colorMap}
                onSave={saveColors}
            />
        </div>
    );
}
