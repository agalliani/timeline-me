
import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ColorSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: string[];
    colorMap: Record<string, string>;
    onSave: (newMap: Record<string, string>) => void;
}

const TAILWIND_COLORS = [
    { name: "slate", class: "bg-zinc-500" },
    { name: "red", class: "bg-red-500" },
    { name: "orange", class: "bg-orange-500" },
    { name: "amber", class: "bg-amber-500" },
    { name: "yellow", class: "bg-yellow-500" },
    { name: "lime", class: "bg-lime-500" },
    { name: "green", class: "bg-green-500" },
    { name: "emerald", class: "bg-emerald-500" },
    { name: "teal", class: "bg-teal-500" },
    { name: "cyan", class: "bg-cyan-500" },
    { name: "sky", class: "bg-sky-500" },
    { name: "blue", class: "bg-blue-500" },
    { name: "indigo", class: "bg-indigo-500" },
    { name: "violet", class: "bg-violet-500" },
    { name: "purple", class: "bg-purple-500" },
    { name: "fuchsia", class: "bg-fuchsia-500" },
    { name: "pink", class: "bg-pink-500" },
    { name: "rose", class: "bg-rose-500" },
];

export function ColorSettingsModal({
    isOpen,
    onClose,
    categories,
    colorMap,
    onSave,
}: ColorSettingsModalProps) {
    const [localMap, setLocalMap] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            setLocalMap({ ...colorMap });
        }
    }, [isOpen, colorMap]);

    const handleColorSelect = (category: string, color: string) => {
        setLocalMap((prev) => ({
            ...prev,
            [category]: color,
        }));
    };

    const handleSave = () => {
        onSave(localMap);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Category Colors</DialogTitle>
                    <DialogDescription>
                        Assign specific colors to your timeline categories to override defaults.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="space-y-6 py-4">
                        {categories.map((category) => (
                            <div key={category} className="space-y-3 p-3 rounded-lg bg-zinc-50 border border-zinc-100">
                                <Label className="text-sm font-semibold capitalize text-zinc-900 block mb-2">
                                    {category || "Uncategorized"}
                                </Label>
                                <div className="flex flex-wrap gap-2">
                                    {TAILWIND_COLORS.map((color) => {
                                        const isSelected = (localMap[category] || "slate") === color.name;
                                        return (
                                            <button
                                                key={color.name}
                                                onClick={() => handleColorSelect(category, color.name)}
                                                className={cn(
                                                    "w-6 h-6 rounded-full transition-all flex items-center justify-center",
                                                    color.class,
                                                    isSelected
                                                        ? "ring-2 ring-offset-2 ring-zinc-400 scale-110"
                                                        : "opacity-70 hover:opacity-100 hover:scale-105"
                                                )}
                                                title={color.name}
                                                type="button"
                                            >
                                                {isSelected && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                        {categories.length === 0 && (
                            <div className="text-center py-8 bg-zinc-50 rounded-lg border border-dashed border-zinc-200">
                                <p className="text-sm text-muted-foreground">
                                    No categories found. Add items to your timeline first to customize their colors.
                                </p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
