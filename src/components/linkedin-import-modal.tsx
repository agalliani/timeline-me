import React, { useState } from 'react';
import { TimelineItem } from '@/types/timeline';
import { parseLinkedInPDF } from '@/lib/linkedin-pdf-adapter';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Check, AlertCircle, Upload, FileText, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface LinkedInImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (items: TimelineItem[]) => void;
}

export function LinkedInImportModal({ isOpen, onClose, onImport }: LinkedInImportModalProps) {
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [parsedItems, setParsedItems] = useState<TimelineItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [step, setStep] = useState<'upload' | 'preview'>('upload');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPdfFile(e.target.files[0]);
            setError(null);
        }
    };

    const processFile = async () => {
        if (!pdfFile) {
            setError("Please upload a PDF file.");
            return;
        }

        setIsParsing(true);
        setError(null);

        try {
            const items = await parseLinkedInPDF(pdfFile);

            if (items.length === 0) {
                setError("No events found in the PDF. Please ensure it is the correct LinkedIn profile export.");
                setIsParsing(false);
                return;
            }

            setParsedItems(items);
            setStep('preview');
        } catch (e) {
            console.error(e);
            setError("Failed to parse PDF. Please ensure it is a valid LinkedIn profile export.");
        } finally {
            setIsParsing(false);
        }
    };

    const confirmImport = () => {
        onImport(parsedItems);
        handleClose();
    };

    const handleClose = () => {
        setPdfFile(null);
        setParsedItems([]);
        setError(null);
        setStep('upload');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] bg-zinc-900 text-zinc-50 border-zinc-800">
                <DialogHeader>
                    <DialogTitle>Import from LinkedIn PDF</DialogTitle>
                    <DialogDescription>
                        Import your work experience and education from your LinkedIn profile PDF.
                    </DialogDescription>
                </DialogHeader>

                {step === 'upload' ? (
                    <div className="space-y-6 py-4">
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>How to get your PDF</AlertTitle>
                            <AlertDescription>
                                1. Go to your LinkedIn Profile.<br />
                                2. Click the <strong>More</strong> button (near your profile picture).<br />
                                3. Select <strong>Save to PDF</strong>.<br />
                                4. Upload the downloaded file below.
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="pdf-file">Profile.pdf</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="pdf-file"
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        className="cursor-pointer bg-zinc-950 text-zinc-50 border-zinc-700 file:text-zinc-50 placeholder:text-zinc-400"
                                    />
                                </div>
                                {pdfFile && <p className="text-sm text-green-500 flex items-center"><Check className="h-3 w-3 mr-1" /> {pdfFile.name} ready</p>}
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-500">{error}</p>}
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Start Review</AlertTitle>
                            <AlertDescription>
                                PDF extraction is not perfect. Please review the items below. You can edit them after importing.
                            </AlertDescription>
                        </Alert>
                        <div className="max-h-[300px] overflow-y-auto space-y-2 border rounded p-2">
                            {parsedItems.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm p-2 border rounded bg-card">
                                    <div className="flex-1 min-w-0 mr-4">
                                        <div className="font-medium truncate" title={item.label}>{item.label}</div>
                                        <div className="text-xs text-muted-foreground capitalize">{item.category}</div>
                                    </div>
                                    <div className="text-muted-foreground whitespace-nowrap">
                                        {item.start} - {item.end || 'Present'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <DialogFooter>
                    {step === 'upload' ? (
                        <Button onClick={processFile} disabled={!pdfFile || isParsing}>
                            {isParsing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Parsing...
                                </>
                            ) : (
                                <>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Parse PDF
                                </>
                            )}
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setStep('upload')}>Back</Button>
                            <Button onClick={confirmImport}>Import Data</Button>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
