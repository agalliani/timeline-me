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
    onDelete?: () => void;
}

import { Button } from "@/components/ui/button";

export function TimelineModal({ isOpen, onClose, onSubmit, initialData, onDelete }: TimelineModalProps) {
    const [isConfirming, setIsConfirming] = useState(false);

    // Reset confirmation state when modal opens/closes or data changes
    useEffect(() => {
        if (isOpen) setIsConfirming(false);
    }, [isOpen, initialData]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{isConfirming ? "Delete Event?" : (initialData ? "Edit Event" : "Add New Event")}</DialogTitle>
                    <DialogDescription>
                        {isConfirming
                            ? "Are you sure you want to delete this event? This action cannot be undone."
                            : (initialData
                                ? "Make changes to your timeline event here. Click save when you're done."
                                : "Enter the details for your new timeline event.")}
                    </DialogDescription>
                </DialogHeader>

                {isConfirming ? (
                    <div className="flex justify-end gap-3 py-4">
                        <Button variant="outline" onClick={() => setIsConfirming(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (onDelete) onDelete();
                                onClose();
                            }}
                        >
                            Confirm Delete
                        </Button>
                    </div>
                ) : (
                    <TimelineForm
                        key={initialData ? JSON.stringify(initialData) : "new"}
                        onSubmit={(data) => {
                            onSubmit(data);
                            onClose();
                        }}
                        defaultValues={initialData || undefined}
                        submitLabel={initialData ? "Save Changes" : "Add Event"}
                        onDelete={onDelete ? () => setIsConfirming(true) : undefined}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
