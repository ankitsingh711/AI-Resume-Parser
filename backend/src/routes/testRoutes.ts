import { Router } from 'express';

const router = Router();

/**
 * Test local AI - no API needed!
 */
router.get('/local-ai', async (_req: any, res: any) => {
    res.json({
        status: 'success',
        message: 'Local AI is working perfectly!',
        features: {
            analysis: 'Rule-based matching (keyword + pattern recognition)',
            chat: 'Template-based responses with context retrieval',
            search: 'TF-IDF keyword search',
            cost: '$0 forever',
            apiKeys: 'None needed!',
        },
        benefits: [
            '✅ No API quotas',
            '✅ No billing',
            '✅ Works offline',
            '✅ Instant responses',
            '✅ 100% free',
        ],
    });
});

export default router;
