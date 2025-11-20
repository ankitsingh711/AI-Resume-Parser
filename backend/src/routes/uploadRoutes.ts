import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { DocumentParser } from '../services/documentParser';
import { TextChunker } from '../services/textChunker';
import { KeywordSearchService } from '../services/keywordSearchService';
import { AnalysisService } from '../services/analysisService';
import { AppError, asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (_req, _file, cb) => {
        const uploadDir = process.env.UPLOAD_DIR || './uploads';
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error as Error, uploadDir);
        }
    },
    filename: (_req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
    },
    fileFilter: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.pdf' && ext !== '.txt') {
            return cb(new Error('Only PDF and TXT files are allowed'));
        }
        cb(null, true);
    },
});

// Store uploaded files temporarily in memory
const uploadedFiles = new Map<
    string,
    {
        resume?: { path: string; text: string };
        jobDescription?: { path: string; text: string };
    }
>();

/**
 * POST /api/upload/resume
 * Upload resume file
 */
router.post(
    '/resume',
    upload.single('file'),
    asyncHandler(async (req: any, res: any) => {
        if (!req.file) {
            throw new AppError('No file uploaded', 400);
        }

        const sessionId = req.body.sessionId || uuidv4();
        const documentParser = new DocumentParser();

        // Parse document
        const parsed = await documentParser.parseDocument(req.file.path);

        // Store in session
        if (!uploadedFiles.has(sessionId)) {
            uploadedFiles.set(sessionId, {});
        }

        const session = uploadedFiles.get(sessionId)!;
        session.resume = {
            path: req.file.path,
            text: parsed.text,
        };

        res.json({
            status: 'success',
            message: 'Resume uploaded successfully',
            sessionId,
            data: {
                fileName: parsed.fileName,
                fileType: parsed.fileType,
                wordCount: parsed.wordCount,
            },
        });
    })
);

/**
 * POST /api/upload/job-description
 * Upload job description file
 */
router.post(
    '/job-description',
    upload.single('file'),
    asyncHandler(async (req: any, res: any) => {
        if (!req.file) {
            throw new AppError('No file uploaded', 400);
        }

        const sessionId = req.body.sessionId;
        if (!sessionId) {
            throw new AppError('Session ID is required', 400);
        }

        const documentParser = new DocumentParser();

        // Parse document
        const parsed = await documentParser.parseDocument(req.file.path);

        // Store in session
        if (!uploadedFiles.has(sessionId)) {
            uploadedFiles.set(sessionId, {});
        }

        const session = uploadedFiles.get(sessionId)!;
        session.jobDescription = {
            path: req.file.path,
            text: parsed.text,
        };

        res.json({
            status: 'success',
            message: 'Job description uploaded successfully',
            data: {
                fileName: parsed.fileName,
                fileType: parsed.fileType,
                wordCount: parsed.wordCount,
            },
        });
    })
);

/**
 * POST /api/upload/analyze
 * Analyze resume against job description
 */
router.post(
    '/analyze',
    asyncHandler(async (req: any, res: any) => {
        const { sessionId } = req.body;

        if (!sessionId) {
            throw new AppError('Session ID is required', 400);
        }

        const session = uploadedFiles.get(sessionId);
        if (!session || !session.resume || !session.jobDescription) {
            throw new AppError('Both resume and job description must be uploaded first', 400);
        }

        // Get services from app locals (set in app.ts)
        const searchService: KeywordSearchService = req.app.locals.searchService;
        const analysisService: AnalysisService = req.app.locals.analysisService;

        // Create text chunker
        const textChunker = new TextChunker();

        // Chunk the resume
        const chunks = textChunker.chunkDocument(session.resume.text, 'resume');

        // Convert chunks to format expected by search service
        const searchChunks = chunks.map((chunk, index) => ({
            text: chunk.text,
            metadata: {
                chunkType: chunk.metadata.chunkType,
                chunkIndex: index,
                source: 'resume',
                resumeId: sessionId,
            },
        }));

        // Add chunks to search service (no API calls needed!)
        await searchService.addDocuments(sessionId, searchChunks);

        // Perform analysis
        const analysis = await analysisService.analyzeMatch(
            session.resume.text,
            session.jobDescription.text
        );

        // Extract resume info
        const resumeInfo = await analysisService.extractResumeInfo(session.resume.text);

        res.json({
            status: 'success',
            data: {
                analysis,
                resumeInfo,
                sessionId,
            },
        });
    })
);

/**
 * DELETE /api/upload/session/:sessionId
 * Clear session data
 */
router.delete(
    '/session/:sessionId',
    asyncHandler(async (req: any, res: any) => {
        const { sessionId } = req.params;

        const session = uploadedFiles.get(sessionId);
        if (session) {
            // Delete uploaded files
            try {
                if (session.resume) {
                    await fs.unlink(session.resume.path);
                }
                if (session.jobDescription) {
                    await fs.unlink(session.jobDescription.path);
                }
            } catch (error) {
                console.error('Error deleting files:', error);
            }

            // Remove from memory
            uploadedFiles.delete(sessionId);

            // Clear from search service
            const searchService: KeywordSearchService = req.app.locals.searchService;
            searchService.deleteByResumeId(sessionId);
        }

        res.json({
            status: 'success',
            message: 'Session cleared',
        });
    })
);

export default router;
