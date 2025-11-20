import OpenAI from 'openai';

export interface Embedding {
    vector: number[];
    text: string;
    model: string;
}

export class EmbeddingService {
    private openai: OpenAI;
    private model: string = 'text-embedding-3-small';

    constructor(apiKey: string) {
        this.openai = new OpenAI({ apiKey });
    }

    /**
     * Generate embedding for a single text
     */
    async generateEmbedding(text: string): Promise<Embedding> {
        try {
            const response = await this.openai.embeddings.create({
                model: this.model,
                input: text,
            });

            return {
                vector: response.data[0].embedding,
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
            // OpenAI API supports batch embeddings
            const response = await this.openai.embeddings.create({
                model: this.model,
                input: texts,
            });

            return response.data.map((item, index) => ({
                vector: item.embedding,
                text: texts[index],
                model: this.model,
            }));
        } catch (error) {
            throw new Error(`Failed to generate embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get embedding dimensions for this model
     */
    getEmbeddingDimensions(): number {
        // text-embedding-3-small has 1536 dimensions
        return 1536;
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
