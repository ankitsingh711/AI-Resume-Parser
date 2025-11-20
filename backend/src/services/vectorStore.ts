import { EmbeddingService } from './embeddingService';
import { TextChunk } from './textChunker';

export interface VectorDocument {
    id: string;
    vector: number[];
    text: string;
    metadata: {
        source: string;
        chunkIndex: number;
        chunkType: string;
        resumeId?: string;
    };
}

export interface SearchResult {
    document: VectorDocument;
    score: number;
}

/**
 * In-memory vector store implementation
 * For production, this could be replaced with Pinecone, Qdrant, or Weaviate
 */
export class VectorStore {
    private documents: VectorDocument[] = [];
    private embeddingService: EmbeddingService;

    constructor(embeddingService: EmbeddingService) {
        this.embeddingService = embeddingService;
    }

    /**
     * Add a single document to the vector store
     */
    async addDocument(
        id: string,
        text: string,
        metadata: VectorDocument['metadata']
    ): Promise<void> {
        const embedding = await this.embeddingService.generateEmbedding(text);

        this.documents.push({
            id,
            vector: embedding.vector,
            text,
            metadata,
        });
    }

    /**
     * Add multiple documents in batch
     */
    async addDocuments(chunks: TextChunk[], resumeId: string): Promise<void> {
        const texts = chunks.map((chunk) => chunk.text);
        const embeddings = await this.embeddingService.generateEmbeddings(texts);

        for (let i = 0; i < chunks.length; i++) {
            this.documents.push({
                id: `${resumeId}_chunk_${i}`,
                vector: embeddings[i].vector,
                text: chunks[i].text,
                metadata: {
                    source: chunks[i].metadata.source,
                    chunkIndex: chunks[i].index,
                    chunkType: chunks[i].metadata.chunkType,
                    resumeId,
                },
            });
        }
    }

    /**
     * Search for similar documents using cosine similarity
     */
    async search(
        query: string,
        topK: number = 5,
        filter?: { resumeId?: string }
    ): Promise<SearchResult[]> {
        // Generate embedding for the query
        const queryEmbedding = await this.embeddingService.generateEmbedding(query);

        // Filter documents if needed
        let searchDocs = this.documents;
        if (filter?.resumeId) {
            searchDocs = this.documents.filter((doc) => doc.metadata.resumeId === filter.resumeId);
        }

        // Calculate similarity scores
        const results: SearchResult[] = searchDocs.map((doc) => ({
            document: doc,
            score: EmbeddingService.cosineSimilarity(queryEmbedding.vector, doc.vector),
        }));

        // Sort by score (descending) and return top K
        results.sort((a, b) => b.score - a.score);

        return results.slice(0, topK);
    }

    /**
     * Get all documents for a specific resume
     */
    getDocumentsByResumeId(resumeId: string): VectorDocument[] {
        return this.documents.filter((doc) => doc.metadata.resumeId === resumeId);
    }

    /**
     * Delete documents by resume ID
     */
    deleteByResumeId(resumeId: string): void {
        this.documents = this.documents.filter((doc) => doc.metadata.resumeId !== resumeId);
    }

    /**
     * Clear all documents
     */
    clear(): void {
        this.documents = [];
    }

    /**
     * Get store statistics
     */
    getStats(): {
        totalDocuments: number;
        uniqueResumes: number;
    } {
        const uniqueResumes = new Set(
            this.documents.map((doc) => doc.metadata.resumeId).filter(Boolean)
        );

        return {
            totalDocuments: this.documents.length,
            uniqueResumes: uniqueResumes.size,
        };
    }
}
