import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, Copy, Code } from "lucide-react";
import { toast } from "sonner";
import { TimelineItem } from "@/types/timeline";
import { encodeTimelineData } from "@/lib/url-utils";

interface EmbedModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: TimelineItem[];
    colorMap: Record<string, string>;

}

export function EmbedModal({ isOpen, onClose, data, colorMap }: EmbedModalProps) {
    const [copied, setCopied] = useState(false);

    const getEmbedCode = () => {
        if (typeof window === 'undefined') return '';

        const encoded = encodeTimelineData(data, colorMap);
        const baseUrl = `${window.location.origin}/timeline-me/embed`;
        const url = `${baseUrl}?data=${encoded}`;

        return `<iframe src="${url}" width="100%" height="600" style="border:none; border-radius: 8px; background: transparent;" title="Timeline Me Embed"></iframe>`;
    };

    const embedCode = getEmbedCode();

    const handleCopy = () => {
        navigator.clipboard.writeText(embedCode);
        setCopied(true);
        toast.success("Embed code copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg bg-[#18181b] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Code className="w-5 h-5 text-blue-400" />
                        Embed Timeline
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Copy the code below to embed your timeline on your website or portfolio.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="relative">
                        <Textarea // Changed from Input to Textarea
                            readOnly
                            value={embedCode}
                            className="bg-black/20 border-white/10 text-zinc-300 font-mono text-xs h-24 p-3 resize-none w-full"
                        />
                        <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-2 right-2 h-8 w-8 hover:bg-white/10"
                            onClick={handleCopy}
                        >
                            {copied ? (
                                <Check className="w-4 h-4 text-green-400" />
                            ) : (
                                <Copy className="w-4 h-4 text-zinc-400" />
                            )}
                        </Button>
                    </div>
                    <div className="text-xs text-amber-500/80 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                        Note: The embed URL contains all your timeline data. If your timeline is very large, the URL might be long.
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="secondary" onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white border-0">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
