import { TimelineItem } from "@/types/timeline";

/**
 * Parses a date string like "January 2020", "Jan 2020", "dicembre 2025" into "MM/YYYY".
 * Returns null if invalid.
 * Handles "Present" / "Presente" by returning null (open end).
 */
const parseDate = (dateStr: string): string | null => {
    if (!dateStr) return null;
    const cleanStr = dateStr.trim().replace(/[()·]/g, ''); // Remove parens and dots
    if (cleanStr.match(/^Present(e)?$/i)) return null;

    // Check for "Month Year" format
    const parts = cleanStr.split(" ");
    if (parts.length >= 2) {
        const monthStr = parts[0].toLowerCase();
        const year = parts[1];

        const monthMap: { [key: string]: string } = {
            // English
            "jan": "01", "feb": "02", "mar": "03", "apr": "04", "may": "05", "jun": "06",
            "jul": "07", "aug": "08", "sep": "09", "oct": "10", "nov": "11", "dec": "12",
            "january": "01", "february": "02", "march": "03", "april": "04", "june": "06",
            "july": "07", "august": "08", "september": "09", "october": "10", "november": "11", "december": "12",
            // Italian
            "gennaio": "01", "febbraio": "02", "marzo": "03", "aprile": "04", "maggio": "05", "giugno": "06",
            "luglio": "07", "agosto": "08", "settembre": "09", "ottobre": "10", "novembre": "11", "dicembre": "12",
            "gen": "01", "febbr": "02", "mag": "05", "giu": "06",
            "lug": "07", "ago": "08", "set": "09", "ott": "10", "dic": "12"
        };

        const month = monthMap[monthStr];
        if (month && /^\d{4}$/.test(year)) {
            return `${month}/${year}`;
        }
    }

    // Check for "YYYY"
    if (/^\d{4}$/.test(cleanStr)) {
        return cleanStr;
    }

    return null;
};

const extractTextFromPDF = async (file: File): Promise<string[]> => {
    // Dynamic import to avoid SSR issues with canvas/DOMMatrix
    const pdfjsLib = await import("pdfjs-dist/build/pdf.min.mjs");

    // Set worker source to local file in public folder
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let lines: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        // We accumulate lines. textContent.items contains strings with position.
        // Simple mapping:
        const pageLines = textContent.items.map((item: any) => item.str).filter((s: string) => s.trim().length > 0);
        lines = [...lines, ...pageLines];
    }

    return lines;
};

export const parseLinkedInPDF = async (file: File): Promise<TimelineItem[]> => {
    const lines = await extractTextFromPDF(file);
    const items: TimelineItem[] = [];

    let section: 'NONE' | 'EXPERIENCE' | 'EDUCATION' = 'NONE';

    // Regex matches: "Jan 2020 - Present" or "Jan 2020 - Dec 2022"
    // Note: PDF text often separates the dash with spaces or uses different dashes
    // Added em-dash (—) and allowed loose spacing
    const monthNames = "January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Gennaio|Febbraio|Marzo|Aprile|Maggio|Giugno|Luglio|Agosto|Settembre|Ottobre|Novembre|Dicembre";

    // Fix: Ensure "Month Year" is matched before "Month" to avoid partial matches on the end date
    // Also support "Present" and "Presente"
    const dateRangeRegex = new RegExp(`^(${monthNames})\\s(\\d{4})\\s*[-–—]\\s*(Present|Presente|(${monthNames})\\s\\d{4}|[A-Za-z]+\\s\\d{4})`, 'i');

    // Education dates often differ: "2010 - 2014" or "(2010 - 2014)"
    const eduDateRegex = /^[(·\s]*(\d{4})\s*[-–—]\s*(\d{4}|Present|Presente)[)\s]*$/i;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Detect Section Headers
        if (line.match(/^E[xs]p?erien[cz](e|a)$/i)) { // Experience or Esperienza
            section = 'EXPERIENCE';
            continue;
        } else if (line.match(/^Ed?ucation$/i) || line.match(/^Formazione$/i)) {
            section = 'EDUCATION';
            continue;
        } else if (line.match(/^Competenze|Skills$/i) || line.match(/^Languages|Lingue$/i)) {
            section = 'NONE'; // End of useful sections
            continue;
        }

        if (section === 'EXPERIENCE') {
            const dateMatch = line.match(dateRangeRegex);
            if (dateMatch) {
                // Found a date line: e.g. "dicembre 2025 - Present"
                const startStr = `${dateMatch[1]} ${dateMatch[2]}`;
                const endStr = dateMatch[3]; // might be "Present" or "Month Year" or partial

                const startDate = parseDate(startStr);
                const endDate = parseDate(endStr);

                if (startDate) {
                    // Backtrack to find Company and Role
                    // Usually: 
                    // i-1: Role (AMS Engineer)
                    // i-2: Company (Bosch Italia)
                    // But sometimes "Duration" lines interfere? e.g. "3 anni 1 mese"

                    let role = "";
                    let company = "";

                    // Look explicitly at previous lines skipping "Duration" lines
                    const durationRegex = /(\d+|un|uno)\s(ann[oi]|mes[ei]|years?|months?)/i;

                    let cursor = i - 1;
                    // Skip duration lines or empty lines
                    while (cursor >= 0 && (lines[cursor].match(durationRegex) || lines[cursor].trim() === "")) {
                        cursor--;
                    }

                    if (cursor >= 0) {
                        role = lines[cursor];
                        cursor--;
                    }

                    // Skip more duration/empty if needed (e.g. Total Company Duration)
                    while (cursor >= 0 && (lines[cursor].match(durationRegex) || lines[cursor].trim() === "")) {
                        cursor--;
                    }

                    if (cursor >= 0) {
                        company = lines[cursor];
                    }

                    // Fallback/Validation
                    if (!company && !role) {
                        continue;
                    }

                    items.push({
                        start: startDate,
                        end: endDate,
                        label: company ? `${role} at ${company}` : role,
                        category: "Work"
                    });
                }
            }
        }

        if (section === 'EDUCATION') {
            // Education often: School -> Degree -> Date
            // Date line often starts with "· (" or just "("
            // Cleaning line for regex
            const cleanLine = line.replace(/^[·\s(]+/, '').replace(/[)]+$/, '');

            // Check for month-year range first (PhD example)
            const dateMatch = cleanLine.match(dateRangeRegex);
            // Check for year-only range (Bachelors)
            const eduYearMatch = cleanLine.match(eduDateRegex);

            if (dateMatch || eduYearMatch) {
                const startStr = dateMatch ? `${dateMatch[1]} ${dateMatch[2]}` : eduYearMatch![1];
                const endStr = dateMatch ? dateMatch[3] : eduYearMatch![2];

                const startDate = parseDate(startStr);
                const endDate = parseDate(endStr);

                if (startDate) {
                    // Backtrack for School and Degree
                    let degree = "";
                    let school = "";

                    let cursor = i - 1;
                    while (cursor >= 0 && lines[cursor].trim() === "") cursor--;

                    if (cursor >= 0) {
                        degree = lines[cursor];
                        cursor--;
                    }

                    while (cursor >= 0 && lines[cursor].trim() === "") cursor--;

                    if (cursor >= 0) {
                        school = lines[cursor];
                    }

                    items.push({
                        start: startDate,
                        end: endDate,
                        label: school ? `${degree} at ${school}` : degree,
                        category: "Education"
                    });
                }
            }
        }
    }

    return items;
};
