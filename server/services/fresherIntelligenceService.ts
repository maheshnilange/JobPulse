import { FreshnessLevel, JobCategory, SourceConfidence, SourceType } from '../types';

export class FresherIntelligenceService {
  /**
   * Intelligently classifies whether a job is targeted for freshers (0-1 yr exp)
   */
  public static isFresherJob(title: string, description: string, experienceText: string, minExp: number): boolean {
    if (minExp === 0) return true;

    const combinedText = `${title} ${description} ${experienceText}`.toLowerCase();

    const fresherKeywords = [
      'fresher',
      'freshers',
      '0 year',
      '0-1 year',
      '0 to 1 year',
      '0 - 1 year',
      '0-1 yr',
      '0-2 year',
      'graduate trainee',
      'graduate engineer trainee',
      'software trainee',
      'trainee software',
      'junior software',
      'entry level',
      'associate software engineer',
      'intern to hire',
      'campus hiring',
      'batch of 2024',
      'batch of 2025',
      'batch of 2026',
      'fresh graduate',
      'b.e / b.tech freshers',
      'mca freshers',
      'entry-level'
    ];

    return fresherKeywords.some(keyword => combinedText.includes(keyword));
  }

  /**
   * Classifies if the job is Java ecosystem focused
   */
  public static isJavaJob(title: string, description: string, skills: string[]): boolean {
    const combinedText = `${title} ${description} ${skills.join(' ')}`.toLowerCase();
    
    // Explicit exclusions if it's purely JavaScript/TypeScript without Java
    const isOnlyJs = (combinedText.includes('javascript') || combinedText.includes('typescript')) && 
                     !combinedText.match(/\bjava\b/) && 
                     !combinedText.includes('spring') && 
                     !combinedText.includes('hibernate');

    if (isOnlyJs) return false;

    const javaKeywords = [
      'java developer',
      'java engineer',
      'java backend',
      'java full stack',
      'core java',
      'spring boot',
      'spring framework',
      'hibernate',
      'jpa',
      'microservices with java',
      'jdk',
      'jvm',
      'j2ee'
    ];

    const hasExplicitJava = /\bjava\b/i.test(title) || skills.some(s => s.toLowerCase() === 'java' || s.toLowerCase() === 'core java' || s.toLowerCase() === 'spring boot');

    return hasExplicitJava || javaKeywords.some(kw => combinedText.includes(kw));
  }

  /**
   * Classifies general software engineering positions
   */
  public static isSoftwareJob(title: string, description: string): boolean {
    const combinedText = `${title} ${description}`.toLowerCase();
    const softwareKeywords = [
      'software engineer',
      'software developer',
      'associate software engineer',
      'application developer',
      'backend developer',
      'full stack developer',
      'frontend developer',
      'qa engineer',
      'test engineer',
      'sdet',
      'software trainee',
      'systems engineer',
      'programmer analyst'
    ];

    return softwareKeywords.some(kw => combinedText.includes(kw));
  }

  /**
   * Calculates Categories for multi-tagging
   */
  public static extractCategories(title: string, description: string, experienceText: string, minExp: number, skills: string[]): JobCategory[] {
    const categories: JobCategory[] = [];
    if (this.isFresherJob(title, description, experienceText, minExp)) {
      categories.push('Fresher');
    }
    if (this.isJavaJob(title, description, skills)) {
      categories.push('Java');
    }
    if (this.isSoftwareJob(title, description)) {
      categories.push('Software');
    }
    if (/qa|testing|test engineer|sdet|automation tester/i.test(`${title} ${description}`)) {
      categories.push('QA_Testing');
    }
    if (categories.length === 0) {
      categories.push('Other');
    }
    return categories;
  }

  /**
   * Calculates freshness score based on detection timestamp relative to current reference time
   */
  public static calculateFreshness(detectedAtIso: string, referenceTimeIso?: string): {
    level: FreshnessLevel;
    badgeText: string;
    minutesAgo: number;
    hoursAgo: number;
  } {
    const detected = new Date(detectedAtIso).getTime();
    const now = referenceTimeIso ? new Date(referenceTimeIso).getTime() : Date.now();
    const diffMs = Math.max(0, now - detected);
    const minutesAgo = Math.floor(diffMs / (1000 * 60));
    const hoursAgo = Math.floor(minutesAgo / 60);

    if (minutesAgo < 15) {
      return {
        level: 'VERY_FRESH',
        badgeText: minutesAgo <= 1 ? 'Just now' : `${minutesAgo} min ago`,
        minutesAgo,
        hoursAgo
      };
    } else if (minutesAgo < 60) {
      return {
        level: 'FRESH',
        badgeText: `${minutesAgo} min ago`,
        minutesAgo,
        hoursAgo
      };
    } else if (hoursAgo < 6) {
      return {
        level: 'RECENT',
        badgeText: `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`,
        minutesAgo,
        hoursAgo
      };
    } else if (hoursAgo < 24) {
      return {
        level: 'TODAY',
        badgeText: 'Today',
        minutesAgo,
        hoursAgo
      };
    } else if (hoursAgo < 72) {
      const days = Math.floor(hoursAgo / 24);
      return {
        level: 'PAST_DAYS',
        badgeText: `${days} day${days > 1 ? 's' : ''} ago`,
        minutesAgo,
        hoursAgo
      };
    } else {
      return {
        level: 'OLD',
        badgeText: 'Archived',
        minutesAgo,
        hoursAgo
      };
    }
  }

  /**
   * Classifies source verification confidence
   */
  public static evaluateSourceConfidence(sourceType: SourceType, companyDomain?: string, jobUrl?: string): SourceConfidence {
    if (sourceType === 'COMPANY_PORTAL' || sourceType === 'OFFICIAL_API') {
      if (companyDomain && jobUrl) {
        try {
          const parsed = new URL(jobUrl);
          if (parsed.hostname.endsWith(companyDomain) || 
              parsed.hostname.includes('myworkdayjobs.com') ||
              parsed.hostname.includes('taleo.net') ||
              parsed.hostname.includes('icims.com') ||
              parsed.hostname.includes('successfactors.com') ||
              parsed.hostname.includes('smartrecruiters.com') ||
              parsed.hostname.includes('greenhouse.io') ||
              parsed.hostname.includes('lever.co')) {
            return 'OFFICIAL_CAREER_PAGE';
          }
        } catch {
          // fallback
        }
      }
      return 'OFFICIAL_CAREER_PAGE';
    }

    if (sourceType === 'NAUKRI' || sourceType === 'LINKEDIN') {
      return 'VERIFIED_JOB_SOURCE';
    }

    return 'THIRD_PARTY_SOURCE';
  }
}
