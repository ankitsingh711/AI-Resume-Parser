import React, { useEffect, useState } from 'react';
import './MatchAnalysis.css';

interface MatchAnalysisProps {
    analysis: {
        matchScore: number;
        strengths: string[];
        gaps: string[];
        overallAssessment: string;
    };
    resumeInfo?: {
        skills: string[];
        experience: string[];
        education: string[];
        summary: string;
    };
}

export const MatchAnalysis: React.FC<MatchAnalysisProps> = ({ analysis, resumeInfo }) => {
    const [animatedScore, setAnimatedScore] = useState(0);

    useEffect(() => {
        // Animate score counting up
        const targetScore = analysis.matchScore;
        const duration = 1500; // 1.5 seconds
        const steps = 60;
        const increment = targetScore / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= targetScore) {
                setAnimatedScore(targetScore);
                clearInterval(timer);
            } else {
                setAnimatedScore(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [analysis.matchScore]);

    const getScoreColor = (score: number) => {
        if (score >= 75) return '#43e97b';
        if (score >= 60) return '#4facfe';
        if (score >= 40) return '#ffbe0b';
        return '#f5576c';
    };

    const circumference = 2 * Math.PI * 54; // radius = 54
    const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

    return (
        <div className="match-analysis slide-up">
            <h2 className="analysis-title">
                <svg className="title-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Match Analysis
            </h2>

            {/* Score Circle */}
            <div className="score-section">
                <div className="score-circle-container">
                    <svg className="score-circle" viewBox="0 0 120 120">
                        <defs>
                            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={getScoreColor(analysis.matchScore)} stopOpacity="1" />
                                <stop offset="100%" stopColor={getScoreColor(analysis.matchScore)} stopOpacity="0.6" />
                            </linearGradient>
                        </defs>
                        <circle
                            cx="60"
                            cy="60"
                            r="54"
                            fill="none"
                            stroke="var(--bg-tertiary)"
                            strokeWidth="8"
                        />
                        <circle
                            cx="60"
                            cy="60"
                            r="54"
                            fill="none"
                            stroke="url(#scoreGradient)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            transform="rotate(-90 60 60)"
                            style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                        />
                    </svg>
                    <div className="score-text">
                        <div className="score-value" style={{ color: getScoreColor(analysis.matchScore) }}>
                            {animatedScore}%
                        </div>
                        <div className="score-label">Match</div>
                    </div>
                </div>
                <p className="overall-assessment">{analysis.overallAssessment}</p>
            </div>

            {/* Strengths and Gaps */}
            <div className="insights-grid">
                {/* Strengths */}
                <div className="insight-card strengths-card">
                    <h3 className="insight-title">
                        <svg className="insight-icon success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Strengths
                    </h3>
                    <ul className="insight-list">
                        {analysis.strengths.map((strength, index) => (
                            <li key={index} className="insight-item strength-item">
                                <span className="item-bullet success-bullet">✓</span>
                                {strength}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Gaps */}
                <div className="insight-card gaps-card">
                    <h3 className="insight-title">
                        <svg className="insight-icon error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Gaps
                    </h3>
                    <ul className="insight-list">
                        {analysis.gaps.map((gap, index) => (
                            <li key={index} className="insight-item gap-item">
                                <span className="item-bullet error-bullet">×</span>
                                {gap}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Resume Info (Optional) */}
            {resumeInfo && (
                <div className="resume-highlights">
                    <h3 className="section-title">Resume Highlights</h3>
                    <div className="highlights-grid">
                        {resumeInfo.skills.length > 0 && (
                            <div className="highlight-box">
                                <div className="highlight-label">Skills</div>
                                <div className="highlight-tags">
                                    {resumeInfo.skills.slice(0, 8).map((skill, index) => (
                                        <span key={index} className="tag">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {resumeInfo.experience.length > 0 && (
                            <div className="highlight-box">
                                <div className="highlight-label">Experience</div>
                                <ul className="highlight-list">
                                    {resumeInfo.experience.slice(0, 3).map((exp, index) => (
                                        <li key={index}>{exp}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {resumeInfo.education.length > 0 && (
                            <div className="highlight-box">
                                <div className="highlight-label">Education</div>
                                <ul className="highlight-list">
                                    {resumeInfo.education.map((edu, index) => (
                                        <li key={index}>{edu}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
