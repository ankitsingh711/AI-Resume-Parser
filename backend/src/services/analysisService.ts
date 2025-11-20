import { GoogleGenerativeAI } from '@google/generative-ai';

export interface MatchAnalysis {
    matchScore: number;
    strengths: string[];
    gaps: string[];
    overallAssessment: string;
}

export class AnalysisService {
    private genAI: GoogleGenerativeAI;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    /**
     * Analyze resume against job description using Gemini
     */
    async analyzeMatch(resumeText: string, jobDescriptionText: string): Promise<MatchAnalysis> {
        try {
            const prompt = this.buildAnalysisPrompt(resumeText, jobDescriptionText);

            const model = this.genAI.getGenerativeModel({
                model: 'gemini-pro',
                generationConfig: {
                    temperature: 0.3,
                    responseMimeType: 'application/json',
                },
            });

            const result = await model.generateContent(prompt);
            const response = result.response.text();

            const analysis = JSON.parse(response);

            // Validate and return
            return {
                matchScore: this.validateScore(analysis.matchScore),
                strengths: Array.isArray(analysis.strengths) ? analysis.strengths : [],
                gaps: Array.isArray(analysis.gaps) ? analysis.gaps : [],
                overallAssessment: analysis.overallAssessment || 'Unable to generate assessment',
            };
        } catch (error) {
            throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Build analysis prompt
     */
    private buildAnalysisPrompt(resumeText: string, jobDescriptionText: string): string {
        return `Analyze how well this candidate's resume matches the job description.

JOB DESCRIPTION:
${jobDescriptionText}

CANDIDATE'S RESUME:
${resumeText}

Provide a comprehensive analysis in the following JSON format:
{
  "matchScore": <number between 0-100>,
  "strengths": [
    "Specific strength 1 with evidence from resume",
    "Specific strength 2 with evidence from resume",
    "Specific strength 3 with evidence from resume"
  ],
  "gaps": [
    "Specific gap or missing requirement 1",
    "Specific gap or missing requirement 2"
  ],
  "overallAssessment": "A 2-3 sentence summary of the candidate's fit for this role"
}

SCORING GUIDELINES:
- 90-100: Exceptional match - meets all requirements + strong extra qualifications
- 75-89: Strong match - meets most requirements with minor gaps
- 60-74: Good match - meets core requirements but has some gaps
- 40-59: Partial match - meets some requirements but has significant gaps
- 0-39: Weak match - major gaps in key requirements

ANALYSIS GUIDELINES:
- Be specific: cite actual skills, years of experience, education, etc. from the resume
- For strengths: mention specific technologies, achievements, or qualifications
- For gaps: identify what's missing from the job requirements
- Be objective and evidence-based
- Consider both technical skills and soft skills/qualifications`;
    }

    /**
     * Validate match score
     */
    private validateScore(score: any): number {
        const numScore = Number(score);
        if (isNaN(numScore)) return 50;
        return Math.max(0, Math.min(100, Math.round(numScore)));
    }

    /**
     * Extract key information from resume using Gemini
     */
    async extractResumeInfo(resumeText: string): Promise<{
        skills: string[];
        experience: string[];
        education: string[];
        summary: string;
    }> {
        try {
            const prompt = `Extract key information from this resume and return it in JSON format:

RESUME:
${resumeText}

Return JSON in this exact format:
{
  "skills": ["skill1", "skill2", ...],
  "experience": ["job title at company (years)", ...],
  "education": ["degree from university", ...],
  "summary": "Brief 1-2 sentence summary of the candidate"
}`;

            const model = this.genAI.getGenerativeModel({
                model: 'gemini-pro',
                generationConfig: {
                    temperature: 0.2,
                    responseMimeType: 'application/json',
                },
            });

            const result = await model.generateContent(prompt);
            const response = result.response.text();

            return JSON.parse(response);
        } catch (error) {
            // Return empty structure if extraction fails
            return {
                skills: [],
                experience: [],
                education: [],
                summary: 'Unable to extract summary',
            };
        }
    }
}
