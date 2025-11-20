import { KeywordSearchService, SearchResult } from './keywordSearchService';

export interface ChatMessage {
    role: 'user' | 'assistant';
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
 * Local RAG Service - NO API NEEDED!
 * Uses keyword search + template-based responses
 */
export class RAGService {
    private searchService: KeywordSearchService;
    private conversations: Map<string, ChatMessage[]> = new Map();

    constructor(_apiKey: string, searchService: KeywordSearchService) {
        this.searchService = searchService;
        // API key not used - keeping for interface compatibility
    }

    /**
     * Main RAG query method - completely local!
     */
    async query(
        question: string,
        resumeId: string,
        conversationId: string
    ): Promise<RAGResponse> {
        try {
            // Step 1: Retrieve relevant context using keyword search
            const searchResults = await this.searchService.search(question, 5, { resumeId });

            // Step 2: Generate answer based on context
            const answer = this.generateAnswer(question, searchResults);

            // Step 3: Update conversation history
            this.updateConversationHistory(conversationId, question, answer);

            // Step 4: Return response with sources
            return {
                answer,
                sources: searchResults.map((result) => ({
                    text: result.text,
                    score: result.score,
                    chunkType: result.metadata.chunkType,
                })),
                conversationId,
            };
        } catch (error) {
            throw new Error(`RAG query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Generate answer based on retrieved context
     */
    private generateAnswer(question: string, searchResults: SearchResult[]): string {
        if (searchResults.length === 0) {
            return "I don't have enough information in the resume to answer that question. The resume may not contain details about this topic.";
        }

        const context = searchResults.map(r => r.text).join('\n\n');
        const questionLower = question.toLowerCase();

        // Question type detection and answer generation
        if (questionLower.includes('degree') || questionLower.includes('education') || questionLower.includes('university')) {
            return this.answerEducationQuestion(context, question);
        }

        if (questionLower.includes('experience') || questionLower.includes('years')) {
            return this.answerExperienceQuestion(context, question);
        }

        if (questionLower.includes('skill') || questionLower.includes('technology') || questionLower.includes('know')) {
            return this.answerSkillsQuestion(context, question);
        }

        if (questionLower.includes('work') || questionLower.includes('company') || questionLower.includes('job')) {
            return this.answerWorkHistoryQuestion(context, question);
        }

        if (questionLower.includes('citizen') || questionLower.includes('authorized') || questionLower.includes('visa')) {
            return this.answerWorkAuthQuestion(context, question);
        }

        // Generic answer based on context
        return this.generateGenericAnswer(context, question);
    }

    private answerEducationQuestion(context: string, question: string): string {
        const contextLower = context.toLowerCase();

        if (contextLower.includes('bachelor') || contextLower.includes('b.s') || contextLower.includes('bs ')) {
            const eduMatch = context.match(/bachelor[^\n]*/i) || context.match(/b\.?s\.?\s+[^\n]*/i);
            if (eduMatch) {
                if (question.toLowerCase().includes('state university')) {
                    if (contextLower.includes('state university') || contextLower.includes('suny')) {
                        return `Yes, the candidate has a degree from a state university. ${eduMatch[0].trim()}`;
                    }
                    return `Based on the available information: ${eduMatch[0].trim()}. Please verify if this is from a state university.`;
                }
                return `Yes, the candidate has the following education: ${eduMatch[0].trim()}`;
            }
        }

        if (contextLower.includes('master') || contextLower.includes('m.s') || contextLower.includes('ms ')) {
            const eduMatch = context.match(/master[^\n]*/i);
            if (eduMatch) {
                return `Yes, the candidate has ${eduMatch[0].trim()}`;
            }
        }

        return "The resume does not clearly specify education details in the available context.";
    }

    private answerExperienceQuestion(context: string, _question: string): string {
        const yearMatches = context.match(/(\d+)\+?\s*(?:years?|yrs?)/i);
        if (yearMatches) {
            return `Based on the resume, the candidate has ${yearMatches[0]} of relevant experience.`;
        }

        const dateRanges = context.match(/(\d{4})\s*-\s*(?:present|\d{4})/gi);
        if (dateRanges && dateRanges.length > 0) {
            return `The candidate has worked from ${dateRanges[0]}, as mentioned in their experience section.`;
        }

        return "Specific years of experience are not clearly stated in this section of the resume.";
    }

    private answerSkillsQuestion(context: string, question: string): string {
        const skills = ['react', 'node', 'python', 'java', 'javascript', 'typescript',
            'aws', 'docker', 'kubernetes', 'sql', 'mongodb', 'postgresql'];

        const foundSkills = skills.filter(skill => context.toLowerCase().includes(skill));

        if (foundSkills.length > 0) {
            return `Yes, the candidate has experience with${foundSkills.length > 1 ? ' multiple technologies including' : ''}: ${foundSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}. Additional details can be found in the skills section.`;
        }

        // Check for specific skill mentioned in question
        const questionWords = question.toLowerCase().split(/\s+/);
        for (const word of questionWords) {
            if (context.toLowerCase().includes(word) && word.length > 3) {
                return `Yes, ${word} is mentioned in the candidate's experience or skills section.`;
            }
        }

        return "This specific skill or technology is not explicitly mentioned in the available resume sections.";
    }

    private answerWorkHistoryQuestion(context: string, _question: string): string {
        const companyMatch = context.match(/(?:at|@)\s+([A-Z][a-zA-Z\s&]+(?:Inc|LLC|Ltd|Corp|Company)?)/);
        const titleMatch = context.match(/(senior|lead|staff|junior)?\s*(software|full[\s-]?stack|backend|frontend|web)\s*(engineer|developer)/i);

        if (companyMatch && titleMatch) {
            return `The candidate worked as a ${titleMatch[0]} at ${companyMatch[1].trim()}.`;
        }

        if (titleMatch) {
            return `The candidate has experience as a ${titleMatch[0]}.`;
        }

        return "Work history details are available in the experience section. Here's a relevant excerpt: " + context.substring(0, 200) + "...";
    }

    private answerWorkAuthQuestion(context: string, _question: string): string {
        const contextLower = context.toLowerCase();

        if (contextLower.includes('citizen') || contextLower.includes('u.s. citizen') || contextLower.includes('us citizen')) {
            return "Yes, the candidate indicates they are a U.S. Citizen and authorized to work in the United States.";
        }

        if (contextLower.includes('authorized') || contextLower.includes('authorization')) {
            return "The candidate indicates they are authorized to work in the United States.";
        }

        if (contextLower.includes('h1b') || contextLower.includes('visa')) {
            return "The resume mentions visa/sponsorship requirements. Please review work authorization details carefully.";
        }

        return "Work authorization status is not clearly specified in the available resume sections.";
    }

    private generateGenericAnswer(context: string, question: string): string {
        // Extract most relevant sentence from context
        const sentences = context.split(/[.!?]\s+/);
        const questionWords = question.toLowerCase().split(/\s+/).filter(w => w.length > 3);

        let bestSentence = sentences[0] || context.substring(0, 200);
        let maxMatches = 0;

        for (const sentence of sentences) {
            const sentenceLower = sentence.toLowerCase();
            const matches = questionWords.filter(word => sentenceLower.includes(word)).length;
            if (matches > maxMatches) {
                maxMatches = matches;
                bestSentence = sentence;
            }
        }

        return `Based on the resume: ${bestSentence.trim()}. Would you like me to elaborate on any specific aspect?`;
    }

    /**
     * Update conversation history
     */
    private updateConversationHistory(
        conversationId: string,
        question: string,
        answer: string
    ): void {
        const history = this.conversations.get(conversationId) || [];

        history.push({ role: 'user', content: question });
        history.push({ role: 'assistant', content: answer });

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
