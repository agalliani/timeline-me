import fs from 'fs/promises';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const pdfPath = './public/Profile.pdf';

async function extractText() {
    try {
        const buffer = await fs.readFile(pdfPath);
        const data = new Uint8Array(buffer);

        // Load the PDF document
        const loadingTask = getDocument({
            data,
            // Disable worker for Node.js environment
            disableFontFace: true,
        });

        const pdfDocument = await loadingTask.promise;
        console.log(`PDF Loaded. Number of pages: ${pdfDocument.numPages}`);

        let fullText = '';

        for (let i = 1; i <= pdfDocument.numPages; i++) {
            const page = await pdfDocument.getPage(i);
            const textContent = await page.getTextContent();

            // Join items with a separator to visualize structure better
            const pageText = textContent.items.map((item) => item.str).join(' | ');
            fullText += `--- Page ${i} ---\n${pageText}\n\n`;
        }

        // Write to file for easy inspection
        await fs.writeFile('pdf_structure_dump.txt', fullText);
        console.log("Text extracted to pdf_structure_dump.txt");

    } catch (error) {
        console.error("Error extracting text:", error);
    }
}

extractText();
