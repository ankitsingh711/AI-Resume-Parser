import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

/**
 * Test Gemini connection
 */
router.get('/gemini', async (_req: any, res: any) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                status: 'error',
                message: 'Gemini API key not configured',
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // Test chat
        const chatModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const chatResult = await chatModel.generateContent('Say "Hello, API is working!" and nothing else.');
        const chatResponse = chatResult.response.text();

        // Test embeddings
        const embeddingModel = genAI.getGenerativeModel({ model: 'embedding-001' });
        const embeddingResult = await embeddingModel.embedContent('test');

        if (!embeddingResult.embedding || !embeddingResult.embedding.values) {
            throw new Error('Invalid embedding response');
        }

        res.json({
            status: 'success',
            message: 'Gemini connection working',
            keyPrefix: apiKey.substring(0, 10) + '...',
            chat: {
                model: 'gemini-pro',
                response: chatResponse,
            },
            embeddings: {
                model: 'embedding-001',
                dimensions: embeddingResult.embedding.values.length,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Gemini connection failed',
            error: error.toString(),
        });
    }
});

export default router;
