import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { TimelineForm } from "./timeline-form";
import { TimelineItem } from "@/types/timeline";
import { useEffect, useState } from "react";

interface TimelineModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: TimelineItem) => void;
    initialData?: TimelineItem | null;
}

export function TimelineModal({ isOpen, onClose, onSubmit, initialData }: TimelineModalProps) {
    // We need to force re-render form when initialData changes to update defaultValues
    // The key={initialData ? 'edit' : 'add'} trick is simple but effective.
    // Or better, key={JSON.stringify(initialData)}

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit Event" : "Add New Event"}</DialogTitle>
                    <DialogDescription>
                        {initialData
                            ? "Make changes to your timeline event here. Click save when you're done."
                            : "Enter the details for your new timeline event."}
                    </DialogDescription>
                </DialogHeader>

                {/* 
                  Key is crucial here! 
                  When initialData changes (e.g. from null to an event), 
                  we want React to remount the form to pick up new defaultValues.
                */}
                <TimelineForm
                    key={initialData ? JSON.stringify(initialData) : "new"}
                    onSubmit={(data) => {
                        onSubmit(data);
                        onClose();
                    }}
                    defaultValues={initialData || undefined}
                    submitLabel={initialData ? "Save Changes" : "Add Event"}
                />
            </DialogContent>
        </Dialog>
    );
}
