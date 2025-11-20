import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import uploadRoutes from './routes/uploadRoutes';
import chatRoutes from './routes/chatRoutes';
import testRoutes from './routes/testRoutes';
import { errorHandler } from './middleware/errorHandler';
import { KeywordSearchService } from './services/keywordSearchService';
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

    // Initialize services - ALL LOCAL, NO API KEYS NEEDED!
    const searchService = new KeywordSearchService();
    const ragService = new RAGService('not-needed', searchService);
    const analysisService = new AnalysisService();

    // Make services available to routes
    app.locals.searchService = searchService;
    app.locals.ragService = ragService;
    app.locals.analysisService = analysisService;

    // Routes
    app.use('/api/upload', uploadRoutes);
    app.use('/api/chat', chatRoutes);
    app.use('/api/test', testRoutes);

    // Health check
    app.get('/api/health', (_req, res) => {
        const stats = searchService.getStats();
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            searchEngine: stats,
            ai: 'Local Rule-Based AI (100% Free, No APIs!)',
        });
    });

    // Error handling (must be last)
    app.use(errorHandler);

    return app;
}
