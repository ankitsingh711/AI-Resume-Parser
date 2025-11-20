/**
 * Simple keyword-based search service (no embeddings needed!)
 * Perfect for demos and avoids all quota issues
 */

export interface SearchResult {
    text: string;
    score: number;
    metadata: {
        chunkType: string;
        chunkIndex: number;
        source: string;
        resumeId: string;
    };
}

export interface TextChunk {
    text: string;
    metadata: {
        chunkType: string;
        chunkIndex: number;
        source: string;
        resumeId: string;
    };
}

export class KeywordSearchService {
    private documents: Map<string, TextChunk[]> = new Map();

    /**
     * Add documents for keyword search
     */
    async addDocuments(resumeId: string, chunks: TextChunk[]): Promise<void> {
        this.documents.set(resumeId, chunks);
    }

    /**
     * Search using keyword matching and TF-IDF-like scoring
     */
    async search(query: string, topK: number, filter?: { resumeId?: string }): Promise<SearchResult[]> {
        const queryTerms = this.tokenize(query.toLowerCase());
        const results: SearchResult[] = [];

        // Get documents to search
        const docsToSearch = filter?.resumeId
            ? this.documents.get(filter.resumeId) || []
            : Array.from(this.documents.values()).flat();

        // Score each document
        for (const doc of docsToSearch) {
            const score = this.calculateScore(queryTerms, doc.text.toLowerCase());

            if (score > 0) {
                results.push({
                    text: doc.text,
                    score,
                    metadata: doc.metadata,
                });
            }
        }

        // Sort by score and return top K
        results.sort((a, b) => b.score - a.score);
        return results.slice(0, topK);
    }

    /**
     * Delete documents by resume ID
     */
    deleteByResumeId(resumeId: string): void {
        this.documents.delete(resumeId);
    }

    /**
     * Get statistics
     */
    getStats(): { totalDocuments: number; totalChunks: number } {
        const totalChunks = Array.from(this.documents.values())
            .reduce((sum, chunks) => sum + chunks.length, 0);

        return {
            totalDocuments: this.documents.size,
            totalChunks,
        };
    }

    /**
     * Tokenize text into words
     */
    private tokenize(text: string): string[] {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2); // Skip very short words
    }

    /**
     * Calculate relevance score using keyword matching
     */
    private calculateScore(queryTerms: string[], documentText: string): number {
        const docTerms = this.tokenize(documentText);
        const docTermSet = new Set(docTerms);

        let score = 0;

        // Exact phrase matching (highest weight)
        const queryPhrase = queryTerms.join(' ');
        if (documentText.includes(queryPhrase)) {
            score += 10;
        }

        // Individual term matching
        for (const term of queryTerms) {
            if (docTermSet.has(term)) {
                // Count occurrences
                const termCount = docTerms.filter(t => t === term).length;

                // TF-IDF-like scoring: more occurrences = higher score
                score += Math.log(1 + termCount);
            }

            // Partial matching (contains)
            if (documentText.includes(term)) {
                score += 0.5;
            }
        }

        // Normalize by document length (prefer shorter, relevant docs)
        const docLength = docTerms.length;
        score = score / Math.log(1 + docLength);

        return score;
    }

    /**
     * Clear all documents
     */
    clear(): void {
        this.documents.clear();
    }
}
