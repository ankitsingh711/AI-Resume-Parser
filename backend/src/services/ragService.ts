import OpenAI from 'openai';
import { VectorStore, SearchResult } from './vectorStore';

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
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
 */
export class RAGService {
    private openai: OpenAI;
    private vectorStore: VectorStore;
    private conversations: Map<string, ChatMessage[]> = new Map();

    constructor(apiKey: string, vectorStore: VectorStore) {
        this.openai = new OpenAI({ apiKey });
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

            // Step 4: Build messages for LLM
            const messages = this.buildMessages(question, context, conversationHistory);

            // Step 5: Generate response using OpenAI
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages,
                temperature: 0.3, // Lower temperature for more focused, factual responses
                max_tokens: 500,
            });

            const answer = completion.choices[0].message.content || 'No response generated';

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
     * Build messages array for LLM
     */
    private buildMessages(
        question: string,
        context: string,
        conversationHistory: ChatMessage[]
    ): ChatMessage[] {
        const systemMessage: ChatMessage = {
            role: 'system',
            content: `You are an expert HR assistant helping recruiters evaluate candidates. 

Your task is to answer questions about a candidate based ONLY on the information provided in their resume context below.

IMPORTANT RULES:
1. Base your answers ONLY on the provided resume context
2. If the information is not in the context, clearly state "This information is not available in the resume"
3. Be specific and cite relevant details from the resume
4. For yes/no questions, provide a clear answer followed by supporting evidence
5. Maintain a professional, objective tone
6. If you're uncertain, acknowledge it rather than guessing

RESUME CONTEXT:
${context}`,
        };

        const userMessage: ChatMessage = {
            role: 'user',
            content: question,
        };

        // Combine: system message + conversation history + current question
        return [systemMessage, ...conversationHistory, userMessage];
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
            content: question,
        });

        // Add assistant answer
        history.push({
            role: 'assistant',
            content: answer,
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
