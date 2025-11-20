import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import uploadRoutes from './routes/uploadRoutes';
import chatRoutes from './routes/chatRoutes';
import { errorHandler } from './middleware/errorHandler';
import { EmbeddingService } from './services/embeddingService';
import { VectorStore } from './services/vectorStore';
import { RAGService } from './services/ragService';
import { AnalysisService } from './services/analysisService';

// Load environment variables
dotenv.config();

export function createApp(): Express {
    const app = express();

    // Middleware
    app.use(cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
    }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Validate required environment variables
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY environment variable is required');
    }

    // Initialize services
    const embeddingService = new EmbeddingService(process.env.OPENAI_API_KEY);
    const vectorStore = new VectorStore(embeddingService);
    const ragService = new RAGService(process.env.OPENAI_API_KEY, vectorStore);
    const analysisService = new AnalysisService(process.env.OPENAI_API_KEY);

    // Make services available to routes
    app.locals.embeddingService = embeddingService;
    app.locals.vectorStore = vectorStore;
    app.locals.ragService = ragService;
    app.locals.analysisService = analysisService;

    // Routes
    app.use('/api/upload', uploadRoutes);
    app.use('/api/chat', chatRoutes);

    // Health check
    app.get('/api/health', (_req, res) => {
        const stats = vectorStore.getStats();
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            vectorStore: stats,
        });
    });

    // Error handling (must be last)
    app.use(errorHandler);

    return app;
}
