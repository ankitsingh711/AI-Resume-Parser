import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';

export interface ParsedDocument {
    text: string;
    fileName: string;
    fileType: 'pdf' | 'txt';
    wordCount: number;
}

export class DocumentParser {
    /**
     * Parse a document (PDF or TXT) and extract text content
     */
    async parseDocument(filePath: string): Promise<ParsedDocument> {
        const ext = path.extname(filePath).toLowerCase();
        const fileName = path.basename(filePath);

        try {
            let text: string;

            if (ext === '.pdf') {
                text = await this.parsePDF(filePath);
            } else if (ext === '.txt') {
                text = await this.parseTXT(filePath);
            } else {
                throw new Error(`Unsupported file type: ${ext}. Only PDF and TXT are supported.`);
            }

            // Clean up the text
            text = this.cleanText(text);

            return {
                text,
                fileName,
                fileType: ext === '.pdf' ? 'pdf' : 'txt',
                wordCount: text.split(/\s+/).length,
            };
        } catch (error) {
            throw new Error(`Failed to parse document: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Parse PDF file
     */
    private async parsePDF(filePath: string): Promise<string> {
        const dataBuffer = await fs.readFile(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
    }

    /**
     * Parse TXT file
     */
    private async parseTXT(filePath: string): Promise<string> {
        return await fs.readFile(filePath, 'utf-8');
    }

    /**
     * Clean and normalize text
     */
    private cleanText(text: string): string {
        return text
            .replace(/\r\n/g, '\n') // Normalize line endings
            .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
            .replace(/\t/g, ' ') // Replace tabs with spaces
            .replace(/\s{2,}/g, ' ') // Remove excessive spaces
            .trim();
    }

    /**
     * Validate file before parsing
     */
    async validateFile(filePath: string, maxSizeMB: number = 10): Promise<void> {
        try {
            const stats = await fs.stat(filePath);
            const fileSizeMB = stats.size / (1024 * 1024);

            if (fileSizeMB > maxSizeMB) {
                throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
            }

            const ext = path.extname(filePath).toLowerCase();
            if (ext !== '.pdf' && ext !== '.txt') {
                throw new Error('Only PDF and TXT files are supported');
            }
        } catch (error) {
            throw new Error(`File validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
