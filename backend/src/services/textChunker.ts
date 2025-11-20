export interface TextChunk {
    text: string;
    index: number;
    metadata: {
        source: string;
        chunkType: 'header' | 'content' | 'section';
        startChar: number;
        endChar: number;
    };
}

export class TextChunker {
    private readonly chunkSize: number;
    private readonly chunkOverlap: number;

    constructor(chunkSize: number = 800, chunkOverlap: number = 200) {
        this.chunkSize = chunkSize;
        this.chunkOverlap = chunkOverlap;
    }

    /**
     * Split document into semantic chunks with overlap
     */
    chunkDocument(text: string, source: string): TextChunk[] {
        const chunks: TextChunk[] = [];

        // First, try to split by semantic sections (common resume headings)
        const sections = this.splitBySections(text);

        if (sections.length > 1) {
            // If we found sections, chunk each section
            let chunkIndex = 0;
            let currentChar = 0;

            for (const section of sections) {
                const sectionChunks = this.chunkBySize(section.text, this.chunkSize, this.chunkOverlap);

                for (let i = 0; i < sectionChunks.length; i++) {
                    chunks.push({
                        text: sectionChunks[i],
                        index: chunkIndex++,
                        metadata: {
                            source,
                            chunkType: section.type,
                            startChar: currentChar,
                            endChar: currentChar + sectionChunks[i].length,
                        },
                    });
                    currentChar += sectionChunks[i].length;
                }
            }
        } else {
            // If no sections found, just chunk by size
            const sizeChunks = this.chunkBySize(text, this.chunkSize, this.chunkOverlap);
            sizeChunks.forEach((chunk, index) => {
                chunks.push({
                    text: chunk,
                    index,
                    metadata: {
                        source,
                        chunkType: 'content',
                        startChar: index * (this.chunkSize - this.chunkOverlap),
                        endChar: index * (this.chunkSize - this.chunkOverlap) + chunk.length,
                    },
                });
            });
        }

        return chunks;
    }

    /**
     * Split document by common resume sections
     */
    private splitBySections(text: string): Array<{ text: string; type: 'header' | 'content' | 'section' }> {
        const sectionHeaders = [
            /^(SUMMARY|PROFESSIONAL SUMMARY|PROFILE|ABOUT ME)/im,
            /^(EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT HISTORY|PROFESSIONAL EXPERIENCE)/im,
            /^(EDUCATION|ACADEMIC BACKGROUND)/im,
            /^(SKILLS|TECHNICAL SKILLS|CORE COMPETENCIES)/im,
            /^(PROJECTS|KEY PROJECTS)/im,
            /^(CERTIFICATIONS|CERTIFICATES)/im,
            /^(AWARDS|ACHIEVEMENTS|HONORS)/im,
        ];

        const lines = text.split('\n');
        const sections: Array<{ text: string; type: 'header' | 'content' | 'section' }> = [];
        let currentSection: string[] = [];
        let currentType: 'header' | 'content' | 'section' = 'content';

        for (const line of lines) {
            const isHeader = sectionHeaders.some((regex) => regex.test(line.trim()));

            if (isHeader) {
                // Save previous section
                if (currentSection.length > 0) {
                    sections.push({
                        text: currentSection.join('\n').trim(),
                        type: currentType,
                    });
                }

                // Start new section
                currentSection = [line];
                currentType = 'section';
            } else {
                currentSection.push(line);
            }
        }

        // Add last section
        if (currentSection.length > 0) {
            sections.push({
                text: currentSection.join('\n').trim(),
                type: currentType,
            });
        }

        return sections.filter((s) => s.text.length > 0);
    }

    /**
     * Chunk text by size with overlap
     */
    private chunkBySize(text: string, chunkSize: number, overlap: number): string[] {
        const chunks: string[] = [];
        const words = text.split(/\s+/);

        for (let i = 0; i < words.length; i += chunkSize - overlap) {
            const chunk = words.slice(i, i + chunkSize).join(' ');
            if (chunk.trim().length > 0) {
                chunks.push(chunk.trim());
            }
        }

        return chunks;
    }

    /**
     * Get chunk statistics
     */
    getChunkStats(chunks: TextChunk[]): {
        totalChunks: number;
        avgChunkSize: number;
        totalCharacters: number;
    } {
        const totalChars = chunks.reduce((sum, chunk) => sum + chunk.text.length, 0);

        return {
            totalChunks: chunks.length,
            avgChunkSize: Math.round(totalChars / chunks.length),
            totalCharacters: totalChars,
        };
    }
}
