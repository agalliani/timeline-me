import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TEMPLATES, TimelineTemplate } from "@/lib/templates";
import { BookOpen, Tv, Briefcase } from "lucide-react";

interface TemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoad: (template: TimelineTemplate) => void;
}

export function TemplateModal({ isOpen, onClose, onLoad }: TemplateModalProps) {
    const handleLoad = (template: TimelineTemplate) => {
        if (confirm(`Are you sure you want to load the "${template.name}" template? This will replace your current timeline data.`)) {
            onLoad(template);
            onClose();
        }
    };

    const getIcon = (id: string) => {
        switch (id) {
            case "books-3-years": return <BookOpen className="w-5 h-5 text-blue-400" />;
            case "tv-series-5-years": return <Tv className="w-5 h-5 text-purple-400" />;
            case "professional-journey": return <Briefcase className="w-5 h-5 text-emerald-400" />;
            default: return <BookOpen className="w-5 h-5" />;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] bg-background/95 backdrop-blur-xl border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Choose a Template</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Start with a pre-filled template to see how the timeline looks.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                    {TEMPLATES.map((template) => (
                        <Card key={template.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => handleLoad(template)}>
                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                <div className="p-2 rounded-lg bg-white/10 border border-white/5">
                                    {getIcon(template.id)}
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-base text-white">{template.name}</CardTitle>
                                    <CardDescription className="text-xs text-muted-foreground">
                                        {template.items.length} items
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {template.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="flex justify-end">
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
