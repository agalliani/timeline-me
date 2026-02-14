import { TimelineItem } from "@/types/timeline";

// Helper to parse CSV lines safely, handling quoted values
const parseCSVLine = (line: string): string[] => {
    const result = [];
    let startValueIndex = 0;
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') {
            inQuotes = !inQuotes;
        } else if (line[i] === ',' && !inQuotes) {
            let val = line.substring(startValueIndex, i).trim();
            // Remove surrounding quotes if present
            if (val.startsWith('"') && val.endsWith('"')) {
                val = val.substring(1, val.length - 1);
            }
            // Unescape double quotes
            val = val.replace(/""/g, '"');
            result.push(val);
            startValueIndex = i + 1;
        }
    }
    // Push the last value
    let val = line.substring(startValueIndex).trim();
    if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1);
    }
    val = val.replace(/""/g, '"');
    result.push(val);

    return result;
};

// Helper to parse "MMM YYYY" (e.g., "Jan 2020") or "YYYY" to "MM/YYYY" or "YYYY"
const parseLinkedInDate = (dateStr: string): string | null => {
    if (!dateStr || dateStr.toLowerCase() === "present") return null;

    // Check for "Jan 2020" format
    const parts = dateStr.split(" ");
    if (parts.length === 2) {
        const monthMap: { [key: string]: string } = {
            "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "May": "05", "Jun": "06",
            "Jul": "07", "Aug": "08", "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12",
            // Full names just in case
            "January": "01", "February": "02", "March": "03", "April": "04", "June": "06",
            "July": "07", "August": "08", "September": "09", "October": "10", "November": "11", "December": "12"
        };
        const month = monthMap[parts[0]];
        const year = parts[1];
        if (month && year) {
            return `${month}/${year}`;
        }
    }

    // Check if it's just a year
    if (/^\d{4}$/.test(dateStr)) {
        return dateStr;
    }

    // Fallback: return as is if it looks somewhat valid, otherwise null
    return dateStr;
};

export const parseLinkedInPositions = (csvContent: string): TimelineItem[] => {
    const lines = csvContent.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) return [];

    // Header usually: "Company Name", "Title", "Description", "Location", "Started On", "Finished On"
    // But index might vary, so we map headers to indices
    const headers = parseCSVLine(lines[0]);

    // Simple mapping assuming standard English export headers
    // We try to find columns by name, fallback to standard indices if not found
    const colCompany = headers.findIndex(h => h.includes("Company Name"));
    const colTitle = headers.findIndex(h => h.includes("Title"));
    const colDesc = headers.findIndex(h => h.includes("Description")); // often empty
    const colStart = headers.findIndex(h => h.includes("Started On"));
    const colEnd = headers.findIndex(h => h.includes("Finished On"));

    const items: TimelineItem[] = [];

    for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        if (cols.length < 3) continue; // Skip malformed lines

        // Default indices if headers not found (based on typical export)
        const company = cols[colCompany !== -1 ? colCompany : 0];
        const title = cols[colTitle !== -1 ? colTitle : 1];
        // const desc = cols[colDesc !== -1 ? colDesc : 2]; 
        const startRaw = cols[colStart !== -1 ? colStart : 4];
        const endRaw = cols[colEnd !== -1 ? colEnd : 5];

        const start = parseLinkedInDate(startRaw);

        // If no start date, we can't really place it on timeline
        if (!start) continue;

        const end = parseLinkedInDate(endRaw);

        items.push({
            start: start,
            end: end, // logic for "Present" handled in parser returning null
            label: company,
            category: "Work", // Hardcoded for Positions file
            // We could append title to label or handle description differently
            // For now, let's make label "Company - Title"
            // Or just Company as per timeline design
        });

        // Let's refine the label: "Title at Company" or just "Company"
        // TimelineItem structure is simple: label, category. 
        // We might want to store extra info? The type definition is stricly specific.
        // Let's modify the label to be descriptive.
        items[items.length - 1].label = `${title} at ${company}`;
    }

    return items;
};

export const parseLinkedInEducation = (csvContent: string): TimelineItem[] => {
    const lines = csvContent.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) return [];

    const headers = parseCSVLine(lines[0]);

    const colSchool = headers.findIndex(h => h.includes("School Name"));
    const colDegree = headers.findIndex(h => h.includes("Degree Name"));
    const colStart = headers.findIndex(h => h.includes("Start Date"));
    const colEnd = headers.findIndex(h => h.includes("End Date"));

    const items: TimelineItem[] = [];

    for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        if (cols.length < 3) continue;

        const school = cols[colSchool !== -1 ? colSchool : 0];
        const degree = cols[colDegree !== -1 ? colDegree : 1];
        const startRaw = cols[colStart !== -1 ? colStart : 2];
        const endRaw = cols[colEnd !== -1 ? colEnd : 3];

        const start = parseLinkedInDate(startRaw);
        if (!start) continue;

        const end = parseLinkedInDate(endRaw);

        items.push({
            start: start,
            end: end,
            label: `${degree} at ${school}`,
            category: "Education",
        });
    }

    return items;
};
