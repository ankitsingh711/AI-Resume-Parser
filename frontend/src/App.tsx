import { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { MatchAnalysis } from './components/MatchAnalysis';
import { ChatInterface } from './components/ChatInterface';
import { apiService, AnalysisResult, handleApiError } from './services/api';
import './App.css';

type AppState = 'upload' | 'analyzing' | 'results';

function App() {
    const [state, setState] = useState<AppState>('upload');
    const [sessionId, setSessionId] = useState<string>('');
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [jdFile, setJdFile] = useState<File | null>(null);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);

    const handleResumeSelect = async (file: File) => {
        setResumeFile(file);
        setError('');
        setIsUploading(true);

        try {
            const response = await apiService.uploadResume(file, sessionId);
            if (response.sessionId) {
                setSessionId(response.sessionId);
            }
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setIsUploading(false);
        }
    };

    const handleJdSelect = async (file: File) => {
        if (!sessionId) {
            setError('Please upload resume first');
            return;
        }

        setJdFile(file);
        setError('');
        setIsUploading(true);

        try {
            await apiService.uploadJobDescription(file, sessionId);
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setIsUploading(false);
        }
    };

    const handleAnalyze = async () => {
        if (!resumeFile || !jdFile || !sessionId) {
            setError('Please upload both resume and job description');
            return;
        }

        setState('analyzing');
        setError('');

        try {
            const result = await apiService.analyzeResume(sessionId);
            setAnalysis(result);
            setState('results');
        } catch (err) {
            setError(handleApiError(err));
            setState('upload');
        }
    };

    const handleSendMessage = async (message: string): Promise<string> => {
        try {
            const response = await apiService.askQuestion(message, sessionId);
            return response.answer;
        } catch (err) {
            throw new Error(handleApiError(err));
        }
    };

    const handleReset = () => {
        if (sessionId) {
            apiService.clearSession(sessionId).catch(console.error);
        }
        setState('upload');
        setSessionId('');
        setResumeFile(null);
        setJdFile(null);
        setAnalysis(null);
        setError('');
    };

    return (
        <div className="app">
            <div className="container">
                {/* Header */}
                <header className="header fade-in">
                    <h1 className="app-title">
                        <svg className="logo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        AI Resume Screening Tool
                    </h1>
                    <p className="app-subtitle">
                        Powered by RAG (Retrieval-Augmented Generation) • Intelligent Resume Analysis
                    </p>
                </header>

                {/* Error Display */}
                {error && (
                    <div className="error-banner fade-in">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </div>
                )}

                {/* Upload Section */}
                {state === 'upload' && (
                    <div className="upload-section fade-in">
                        <div className="upload-grid">
                            <FileUpload
                                label="1. Upload Resume"
                                accept=".pdf,.txt"
                                onFileSelect={handleResumeSelect}
                                disabled={isUploading}
                                fileName={resumeFile?.name}
                            />

                            <FileUpload
                                label="2. Upload Job Description"
                                accept=".pdf,.txt"
                                onFileSelect={handleJdSelect}
                                disabled={isUploading || !sessionId}
                                fileName={jdFile?.name}
                            />
                        </div>

                        <button
                            className="btn btn-primary analyze-btn glow-on-hover"
                            onClick={handleAnalyze}
                            disabled={!resumeFile || !jdFile || isUploading}
                        >
                            {isUploading ? (
                                <>
                                    <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Analyze Resume
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Analyzing State */}
                {state === 'analyzing' && (
                    <div className="analyzing-state fade-in">
                        <div className="spinner" />
                        <h2>Analyzing Resume...</h2>
                        <p className="text-secondary">
                            Using RAG to compare resume with job description
                        </p>
                        <div className="analyzing-steps">
                            <div className="step">✓ Parsing documents</div>
                            <div className="step">✓ Generating embeddings</div>
                            <div className="step">✓ Analyzing match</div>
                        </div>
                    </div>
                )}

                {/* Results Section */}
                {state === 'results' && analysis && (
                    <div className="results-section">
                        <div className="results-header">
                            <button className="btn btn-secondary" onClick={handleReset}>
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                New Analysis
                            </button>
                        </div>

                        <MatchAnalysis
                            analysis={analysis.analysis}
                            resumeInfo={analysis.resumeInfo}
                        />

                        <ChatInterface
                            onSendMessage={handleSendMessage}
                            isLoading={false}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
