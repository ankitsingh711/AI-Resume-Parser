import { GoogleGenerativeAI } from '@google/generative-ai';
import { VectorStore, SearchResult } from './vectorStore';

export interface ChatMessage {
    role: 'user' | 'model';
    parts: string;
}

export interface RAGResponse {
    answer: string;
    sources: Array<{
        text: string;
        score: number;
        chunkType: string;
    }>;
    conversationId: string;
}

/**
 * RAG Service implementing the full Retrieval-Augmented Generation flow
 * Now using Google Gemini for generation
 */
export class RAGService {
    private genAI: GoogleGenerativeAI;
    private vectorStore: VectorStore;
    private conversations: Map<string, ChatMessage[]> = new Map();

    constructor(apiKey: string, vectorStore: VectorStore) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.vectorStore = vectorStore;
    }

    /**
     * Main RAG query method
     * Flow: Question → Embedding → Vector Search → Retrieve Context → LLM Generate
     */
    async query(
        question: string,
        resumeId: string,
        conversationId: string
    ): Promise<RAGResponse> {
        try {
            // Step 1: Retrieve relevant context from vector store
            const searchResults = await this.vectorStore.search(question, 5, { resumeId });

            // Step 2: Extract context from search results
            const context = this.buildContext(searchResults);

            // Step 3: Get or create conversation history
            const conversationHistory = this.getConversationHistory(conversationId);

            // Step 4: Build system instruction with context
            const systemInstruction = this.buildSystemInstruction(context);

            // Step 5: Generate response using Gemini
            const model = this.genAI.getGenerativeModel({
                model: 'gemini-pro',
                systemInstruction,
            });

            // Convert history to Gemini format
            const history = conversationHistory.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.parts }],
            }));

            const chat = model.startChat({ history });
            const result = await chat.sendMessage(question);
            const answer = result.response.text();

            // Step 6: Update conversation history
            this.updateConversationHistory(conversationId, question, answer);

            // Step 7: Return response with sources
            return {
                answer,
                sources: searchResults.map((result) => ({
                    text: result.document.text,
                    score: result.score,
                    chunkType: result.document.metadata.chunkType,
                })),
                conversationId,
            };
        } catch (error) {
            throw new Error(`RAG query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Build context string from search results
     */
    private buildContext(searchResults: SearchResult[]): string {
        if (searchResults.length === 0) {
            return 'No relevant information found in the resume.';
        }

        const contextParts = searchResults.map((result, index) => {
            return `[Source ${index + 1}] (Relevance: ${(result.score * 100).toFixed(1)}%)\n${result.document.text}`;
        });

        return contextParts.join('\n\n');
    }

    /**
     * Build system instruction for Gemini
     */
    private buildSystemInstruction(context: string): string {
        return `You are an expert HR assistant helping recruiters evaluate candidates. 

Your task is to answer questions about a candidate based ONLY on the information provided in their resume context below.

IMPORTANT RULES:
1. Base your answers ONLY on the provided resume context
2. If the information is not in the context, clearly state "This information is not available in the resume"
3. Be specific and cite relevant details from the resume
4. For yes/no questions, provide a clear answer followed by supporting evidence
5. Maintain a professional, objective tone
6. If you're uncertain, acknowledge it rather than guessing

RESUME CONTEXT:
${context}`;
    }

    /**
     * Get conversation history
     */
    private getConversationHistory(conversationId: string): ChatMessage[] {
        return this.conversations.get(conversationId) || [];
    }

    /**
     * Update conversation history
     */
    private updateConversationHistory(
        conversationId: string,
        question: string,
        answer: string
    ): void {
        const history = this.getConversationHistory(conversationId);

        // Add user question
        history.push({
            role: 'user',
            parts: question,
        });

        // Add model answer
        history.push({
            role: 'model',
            parts: answer,
        });

        // Keep only last 10 messages (5 exchanges) to avoid context limit
        if (history.length > 10) {
            history.splice(0, history.length - 10);
        }

        this.conversations.set(conversationId, history);
    }

    /**
     * Clear conversation history
     */
    clearConversation(conversationId: string): void {
        this.conversations.delete(conversationId);
    }

    /**
     * Get all conversations
     */
    getAllConversations(): Map<string, ChatMessage[]> {
        return this.conversations;
    }
}
