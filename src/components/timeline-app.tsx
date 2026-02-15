"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toPng } from "html-to-image";
import { cn } from "@/lib/utils";
import { TimelineItem } from "@/types/timeline";
import { TimelineVertical } from "@/components/timeline-vertical";
import { TimelineModal } from "@/components/timeline-modal";
import { LinkedInImportModal } from "@/components/linkedin-import-modal";
import { ColorSettingsModal } from "@/components/color-settings-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Share2, Download, Trash2, Plus, Upload, Palette, LayoutList, PanelTop } from "lucide-react";
import { toast } from "sonner";
import { TimelineDisplay } from "@/components/timeline-display";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";

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
                        transform: 'none', // Prevent motion transform issues
                    }
                });
                const link = document.createElement('a');
                link.download = 'timeline-me-export.png';
                link.href = dataUrl;
                link.click();
                toast.success("Image exported!");
            } catch (err) {
                console.error(err);
                toast.error("Failed to generate image.");
            }
        }
    };

    // Extract unique categories for settings
    const uniqueCategories = Array.from(new Set(data.map(d => d.category || "Uncategorized"))).sort();

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            < Card className="bg-background/60 backdrop-blur-xl border-white/10 shadow-sm sticky top-4 z-50">
                <CardContent className="p-4 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/5">
                            <span className="font-mono font-bold text-white">T</span>
                        </div>
                        <h1 className="font-bold text-lg tracking-tight hidden sm:block">Timeline Me</h1>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto justify-end">
                        {/* Desktop View: Full Actions */}
                        <div className="hidden md:flex gap-2 items-center">
                            <Button onClick={() => { setIsModalOpen(false); setIsImportModalOpen(false); setIsColorModalOpen(true); }} variant="outline" size="sm" className="gap-2 border-white/10 bg-white/5 hover:bg-white/10">
                                <Palette className="w-4 h-4" /> Colors
                            </Button>
                            <Button onClick={() => { setIsModalOpen(false); setIsColorModalOpen(false); setIsImportModalOpen(true); }} variant="outline" size="sm" className="gap-2 border-white/10 bg-white/5 hover:bg-white/10">
                                <Upload className="w-4 h-4" /> Import LinkedIn
                            </Button>
                            <Button onClick={handleAdd} size="sm" className="gap-2 bg-white text-black hover:bg-white/90 border-0 shadow-md font-medium">
                                <Plus className="w-4 h-4" /> Add Event
                            </Button>


                            <div className="flex bg-white/5 rounded-lg border border-white/10 p-1 mr-2">
                                <Button
                                    onClick={() => setViewMode('vertical')}
                                    size="sm"
                                    variant="ghost"
                                    className={cn("h-7 px-2", viewMode === 'vertical' ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white")}
                                    title="Vertical View"
                                >
                                    <LayoutList className="w-4 h-4" />
                                </Button>
                                <Button
                                    onClick={() => setViewMode('horizontal')}
                                    size="sm"
                                    variant="ghost"
                                    className={cn("h-7 px-2", viewMode === 'horizontal' ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white")}
                                    title="Horizontal View"
                                >
                                    <PanelTop className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="w-px h-6 bg-white/10 mx-1" />

                            <Button onClick={handleShare} variant="ghost" size="icon" title="Share URL">
                                <Share2 className="w-4 h-4 text-white/70" />
                            </Button>
                            <Button onClick={handleScreenshot} variant="ghost" size="icon" title="Download Image">
                                <Download className="w-4 h-4 text-white/70" />
                            </Button>
                            <Button onClick={handleClear} variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" title="Clear All">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Mobile View: Compact Actions */}
                        <div className="flex md:hidden gap-2 items-center w-full justify-between">
                            <Button onClick={handleAdd} size="sm" className="flex-1 bg-white text-black border-0 shadow-md">
                                <Plus className="w-4 h-4 mr-2" /> Add
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon" className="border-white/10 bg-white/5">
                                        <Menu className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 bg-[#18181b] border-white/10 text-white">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-white/10" />
                                    <DropdownMenuItem onClick={() => { setIsModalOpen(false); setIsImportModalOpen(false); setIsColorModalOpen(true); }}>
                                        <Palette className="w-4 h-4 mr-2" /> Colors
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => { setIsModalOpen(false); setIsColorModalOpen(false); setIsImportModalOpen(true); }}>
                                        <Upload className="w-4 h-4 mr-2" /> Import LinkedIn
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-white/10" />
                                    <DropdownMenuItem onClick={handleShare}>
                                        <Share2 className="w-4 h-4 mr-2" /> Share Link
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleScreenshot}>
                                        <Download className="w-4 h-4 mr-2" /> Download Image
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-white/10" />
                                    <DropdownMenuItem onClick={handleClear} className="text-red-400 focus:text-red-400 focus:bg-red-500/10">
                                        <Trash2 className="w-4 h-4 mr-2" /> Clear All Data
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
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
                onSubmit={handleSave}
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
        </div >
    );
}
