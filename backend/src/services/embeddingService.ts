import { GoogleGenerativeAI } from '@google/generative-ai';

export interface Embedding {
    vector: number[];
    text: string;
    model: string;
}

export class EmbeddingService {
    private genAI: GoogleGenerativeAI;
    private model: string = 'embedding-001';

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    /**
     * Generate embedding for a single text using Gemini
     */
    async generateEmbedding(text: string): Promise<Embedding> {
        try {
            const model = this.genAI.getGenerativeModel({ model: this.model });
            const result = await model.embedContent(text);

            if (!result.embedding || !result.embedding.values) {
                throw new Error('Invalid embedding response from Gemini');
            }

            return {
                vector: result.embedding.values,
                text,
                model: this.model,
            };
        } catch (error) {
            throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Generate embeddings for multiple texts in batch
     */
    async generateEmbeddings(texts: string[]): Promise<Embedding[]> {
        try {
            const model = this.genAI.getGenerativeModel({ model: this.model });

            // Gemini embedContent works one at a time, so we'll batch them
            const embeddings: Embedding[] = [];

            for (let i = 0; i < texts.length; i++) {
                const result = await model.embedContent(texts[i]);

                if (!result.embedding || !result.embedding.values) {
                    throw new Error(`Missing embedding for text at index ${i}`);
                }

                embeddings.push({
                    vector: result.embedding.values,
                    text: texts[i],
                    model: this.model,
                });
            }

            return embeddings;
        } catch (error) {
            throw new Error(`Failed to generate embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get embedding dimensions for this model
     */
    getEmbeddingDimensions(): number {
        // embedding-001 has 768 dimensions
        return 768;
    }

    /**
     * Calculate cosine similarity between two vectors
     */
    static cosineSimilarity(vecA: number[], vecB: number[]): number {
        if (vecA.length !== vecB.length) {
            throw new Error('Vectors must have the same dimensions');
        }

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        normA = Math.sqrt(normA);
        normB = Math.sqrt(normB);

        if (normA === 0 || normB === 0) {
            return 0;
        }

        return dotProduct / (normA * normB);
    }
}
