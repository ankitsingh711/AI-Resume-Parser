import { Router } from 'express';
import { RAGService } from '../services/ragService';
import { AppError, asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * POST /api/chat
 * Ask a question about the resume using RAG
 */
router.post(
    '/',
    asyncHandler(async (req: any, res: any) => {
        const { question, sessionId } = req.body;

        if (!question || !sessionId) {
            throw new AppError('Question and session ID are required', 400);
        }

        // Get RAG service from app locals
        const ragService: RAGService = req.app.locals.ragService;

        // Query using RAG
        const response = await ragService.query(question, sessionId, sessionId);

        res.json({
            status: 'success',
            data: response,
        });
    })
);

/**
 * GET /api/chat/history/:sessionId
 * Get conversation history
 */
router.get(
    '/history/:sessionId',
    asyncHandler(async (req: any, res: any) => {
        const { sessionId } = req.params;

        const ragService: RAGService = req.app.locals.ragService;
        const conversations = ragService.getAllConversations();
        const history = conversations.get(sessionId) || [];

        res.json({
            status: 'success',
            data: {
                history,
                messageCount: history.length,
            },
        });
    })
);

/**
 * DELETE /api/chat/history/:sessionId
 * Clear conversation history
 */
router.delete(
    '/history/:sessionId',
    asyncHandler(async (req: any, res: any) => {
        const { sessionId } = req.params;

        const ragService: RAGService = req.app.locals.ragService;
        ragService.clearConversation(sessionId);

        res.json({
            status: 'success',
            message: 'Conversation history cleared',
        });
    })
);

export default router;
