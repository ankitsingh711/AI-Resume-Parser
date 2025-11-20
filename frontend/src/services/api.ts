import axios, { AxiosError } from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface UploadResponse {
    status: string;
    message: string;
    sessionId?: string;
    data?: any;
}

export interface AnalysisResult {
    analysis: {
        matchScore: number;
        strengths: string[];
        gaps: string[];
        overallAssessment: string;
    };
    resumeInfo: {
        skills: string[];
        experience: string[];
        education: string[];
        summary: string;
    };
    sessionId: string;
}

export interface ChatResponse {
    answer: string;
    sources: Array<{
        text: string;
        score: number;
        chunkType: string;
    }>;
    conversationId: string;
}

class ApiService {
    async uploadResume(file: File, sessionId?: string): Promise<UploadResponse> {
        const formData = new FormData();
        formData.append('file', file);
        if (sessionId) {
            formData.append('sessionId', sessionId);
        }

        const response = await api.post('/upload/resume', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    }

    async uploadJobDescription(file: File, sessionId: string): Promise<UploadResponse> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('sessionId', sessionId);

        const response = await api.post('/upload/job-description', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    }

    async analyzeResume(sessionId: string): Promise<AnalysisResult> {
        const response = await api.post('/upload/analyze', { sessionId });
        return response.data.data;
    }

    async askQuestion(question: string, sessionId: string): Promise<ChatResponse> {
        const response = await api.post('/chat', { question, sessionId });
        return response.data.data;
    }

    async getChatHistory(sessionId: string): Promise<any> {
        const response = await api.get(`/chat/history/${sessionId}`);
        return response.data.data;
    }

    async clearSession(sessionId: string): Promise<void> {
        await api.delete(`/upload/session/${sessionId}`);
    }

    async healthCheck(): Promise<any> {
        const response = await api.get('/health');
        return response.data;
    }
}

export const apiService = new ApiService();

export const handleApiError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>;
        return axiosError.response?.data?.message || axiosError.message || 'An error occurred';
    }
    return 'An unexpected error occurred';
};
