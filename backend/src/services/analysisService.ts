/**
 * Local Rule-Based Analysis Service
 * NO API NEEDED - Works 100% offline!
 */

export interface MatchAnalysis {
    matchScore: number;
    strengths: string[];
    gaps: string[];
    overallAssessment: string;
}

export class AnalysisService {
    /**
     * Analyze resume against job description using smart keyword matching
     */
    async analyzeMatch(resumeText: string, jobDescriptionText: string): Promise<MatchAnalysis> {
        const resume = resumeText.toLowerCase();
        const jd = jobDescriptionText.toLowerCase();

        // Extract required skills from JD
        const requiredSkills = this.extractSkills(jd);
        const resumeSkills = this.extractSkills(resume);

        // Find matching and missing skills
        const matchingSkills = requiredSkills.filter(skill =>
            resumeSkills.includes(skill) || resume.includes(skill)
        );
        const missingSkills = requiredSkills.filter(skill =>
            !resumeSkills.includes(skill) && !resume.includes(skill)
        );

        // Calculate match score
        const skillMatchPercentage = requiredSkills.length > 0
            ? (matchingSkills.length / requiredSkills.length) * 100
            : 50;

        // Check experience requirements
        const requiredYears = this.extractYearsRequired(jd);
        const candidateYears = this.extractYearsExperience(resume);
        const experienceScore = this.calculateExperienceScore(candidateYears, requiredYears);

        // Check education
        const hasEducation = this.checkEducation(resume, jd);
        const educationScore = hasEducation ? 100 : 0;

        // Overall score (weighted average)
        const matchScore = Math.round(
            (skillMatchPercentage * 0.6) +
            (experienceScore * 0.3) +
            (educationScore * 0.1)
        );

        // Generate strengths
        const strengths = this.generateStrengths(matchingSkills, candidateYears, resume);

        // Generate gaps
        const gaps = this.generateGaps(missingSkills, requiredYears, candidateYears, hasEducation);

        // Overall assessment
        const overallAssessment = this.generateAssessment(matchScore, strengths.length, gaps.length);

        return {
            matchScore: Math.max(0, Math.min(100, matchScore)),
            strengths,
            gaps,
            overallAssessment,
        };
    }

    /**
     * Extract key information from resume
     */
    async extractResumeInfo(resumeText: string): Promise<{
        skills: string[];
        experience: string[];
        education: string[];
        summary: string;
    }> {
        const resume = resumeText.toLowerCase();
        const skills = this.extractSkills(resumeText);
        const years = this.extractYearsExperience(resume);

        // Extract education
        const education: string[] = [];
        if (resume.includes('bachelor') || resume.includes('bs ') || resume.includes('b.s.')) {
            const eduMatch = resumeText.match(/bachelor[^.\n]*/i) ||
                resumeText.match(/b\.?s\.?\s+[^.\n]*/i);
            if (eduMatch) education.push(eduMatch[0].trim());
        }
        if (resume.includes('master') || resume.includes('ms ') || resume.includes('m.s.')) {
            const eduMatch = resumeText.match(/master[^.\n]*/i) ||
                resumeText.match(/m\.?s\.?\s+[^.\n]*/i);
            if (eduMatch) education.push(eduMatch[0].trim());
        }

        // Extract experience
        const experience: string[] = [];
        const experienceMatch = resumeText.match(/(?:senior|lead|staff|junior)?\s*(?:software|full[\s-]?stack|backend|frontend|web)\s*(?:engineer|developer)/gi);
        if (experienceMatch) {
            experience.push(...experienceMatch.slice(0, 3));
        }

        const summary = `${years > 0 ? years + '+ years of' : 'Experienced'} professional with skills in ${skills.slice(0, 5).join(', ')}`;

        return {
            skills: skills.slice(0, 15),
            experience,
            education,
            summary,
        };
    }

    private extractSkills(text: string): string[] {
        const commonSkills = [
            'react', 'angular', 'vue', 'node.js', 'nodejs', 'express', 'python', 'java',
            'javascript', 'typescript', 'html', 'css', 'sql', 'mongodb', 'postgresql',
            'mysql', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'k8s', 'redis',
            'graphql', 'rest', 'api', 'microservices', 'git', 'ci/cd', 'jenkins',
            'terraform', 'ansible', 'linux', 'agile', 'scrum', 'jira', 'redux',
            'next.js', 'nestjs', 'spring', 'django', 'flask', 'fastapi', '.net',
            'c++', 'go', 'rust', 'php', 'ruby', 'rails', 'laravel', 'elasticsearch',
        ];

        const found: string[] = [];
        for (const skill of commonSkills) {
            if (text.toLowerCase().includes(skill)) {
                found.push(skill);
            }
        }
        return found;
    }

    private extractYearsRequired(jdText: string): number {
        const yearMatches = jdText.match(/(\d+)\+?\s*(?:years?|yrs?)/i);
        return yearMatches ? parseInt(yearMatches[1]) : 0;
    }

    private extractYearsExperience(resumeText: string): number {
        const yearMatches = resumeText.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp)/i);
        if (yearMatches) return parseInt(yearMatches[1]);

        // Try to find date ranges
        const dateRanges = resumeText.match(/(\d{4})\s*-\s*(?:present|\d{4})/gi);
        if (dateRanges && dateRanges.length > 0) {
            const currentYear = new Date().getFullYear();
            const firstDate = parseInt(dateRanges[0].match(/\d{4}/)?.[0] || '0');
            return currentYear - firstDate;
        }

        return 0;
    }

    private calculateExperienceScore(candidateYears: number, requiredYears: number): number {
        if (requiredYears === 0) return 100;
        if (candidateYears >= requiredYears) return 100;
        if (candidateYears === 0) return 30;
        return Math.round((candidateYears / requiredYears) * 100);
    }

    private checkEducation(resume: string, jd: string): boolean {
        const hasEducationRequirement = jd.includes('degree') || jd.includes('bachelor') ||
            jd.includes('education') || jd.includes('university');

        if (!hasEducationRequirement) return true;

        return resume.includes('bachelor') || resume.includes('master') ||
            resume.includes('degree') || resume.includes('university') ||
            resume.includes('college');
    }

    private generateStrengths(matchingSkills: string[], years: number, resume: string): string[] {
        const strengths: string[] = [];

        if (matchingSkills.length >= 5) {
            strengths.push(`Strong technical skill set with ${matchingSkills.slice(0, 5).join(', ')}`);
        }

        if (years >= 5) {
            strengths.push(`${years}+ years of professional experience`);
        } else if (years >= 3) {
            strengths.push(`${years} years of relevant experience`);
        }

        if (resume.includes('bachelor') || resume.includes('degree')) {
            if (resume.includes('computer science') || resume.includes('cs ')) {
                strengths.push('Computer Science degree');
            } else {
                strengths.push('University degree');
            }
        }

        if (resume.includes('lead') || resume.includes('senior')) {
            strengths.push('Senior-level experience');
        }

        if (resume.includes('architect') || resume.includes('design')) {
            strengths.push('System design and architecture experience');
        }

        return strengths.slice(0, 6);
    }

    private generateGaps(missingSkills: string[], requiredYears: number, candidateYears: number, hasEducation: boolean): string[] {
        const gaps: string[] = [];

        if (missingSkills.length > 0) {
            for (const skill of missingSkills.slice(0, 3)) {
                gaps.push(`No ${skill} experience mentioned`);
            }
        }

        if (requiredYears > 0 && candidateYears < requiredYears) {
            gaps.push(`Experience (${candidateYears} years) below requirement (${requiredYears}+ years)`);
        }

        if (!hasEducation) {
            gaps.push('Education requirement not clearly met');
        }

        return gaps.slice(0, 5);
    }

    private generateAssessment(score: number, strengthsCount: number, gapsCount: number): string {
        if (score >= 80) {
            return `Excellent match for this role. Candidate demonstrates ${strengthsCount} key strengths with minimal gaps. Strong recommendation to proceed with interview.`;
        } else if (score >= 60) {
            return `Good match for this role. Candidate shows ${strengthsCount} relevant strengths, though ${gapsCount} areas could be improved. Recommend for interview.`;
        } else if (score >= 40) {
            return `Moderate match. While the candidate has ${strengthsCount} positive aspects, there are ${gapsCount} notable gaps. May be worth considering if other factors align.`;
        } else {
            return `Limited match for this role. Significant gaps identified (${gapsCount} areas) that may impact suitability. Consider other candidates.`;
        }
    }
}
