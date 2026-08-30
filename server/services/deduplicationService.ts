import { DiscoveredSource, Job } from '../types';

export interface DeduplicationResult {
  isDuplicate: boolean;
  existingJob?: Job;
  confidence: number;
  reason?: string;
}

export class DeduplicationService {
  /**
   * Normalizes a company name for fuzzy matching (e.g. 'TCS Ltd.' -> 'tcs')
   */
  public static normalizeCompanyName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\b(ltd|limited|inc|technologies|technology|pvt|private|corporation|corp|solutions|services|india|consultancy)\b/gi, '')
      .replace(/[^a-z0-9]/g, '')
      .trim();
  }

  /**
   * Normalizes a job title for fuzzy matching (e.g. 'Jr. Java Developer - Fresher' -> 'java developer')
   */
  public static normalizeJobTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/\b(jr|junior|sr|senior|associate|trainee|fresher|freshers|engineer|developer|specialist|lead)\b/gi, (match) => {
        // preserve role intent in standard form
        if (/junior|jr|fresher|trainee/i.test(match)) return 'trainee';
        if (/developer|engineer/i.test(match)) return 'dev';
        return '';
      })
      .replace(/[^a-z0-9]/g, '')
      .trim();
  }

  /**
   * Normalizes city / location
   */
  public static normalizeLocation(loc: string): string {
    return loc.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  }

  /**
   * Checks if an incoming job matches any existing job in the database
   */
  public static findDuplicate(incoming: Partial<Job>, existingJobs: Job[]): DeduplicationResult {
    // 1. Direct external ID or canonical job URL match
    if (incoming.externalJobId) {
      const matchById = existingJobs.find(j => j.externalJobId === incoming.externalJobId && j.companyId === incoming.companyId);
      if (matchById) {
        return { isDuplicate: true, existingJob: matchById, confidence: 1.0, reason: 'Exact external job ID & company match' };
      }
    }

    if (incoming.jobUrl) {
      const matchByUrl = existingJobs.find(j => j.jobUrl === incoming.jobUrl);
      if (matchByUrl) {
        return { isDuplicate: true, existingJob: matchByUrl, confidence: 1.0, reason: 'Exact job URL match' };
      }
    }

    // 2. High-confidence heuristic match: Same Company + Same Normalized Title + Same City
    const normIncomingComp = this.normalizeCompanyName(incoming.companyName || '');
    const normIncomingTitle = this.normalizeJobTitle(incoming.title || '');
    const normIncomingCity = this.normalizeLocation(incoming.city || incoming.location || '');

    for (const existing of existingJobs) {
      const normExistComp = this.normalizeCompanyName(existing.companyName);
      const normExistTitle = this.normalizeJobTitle(existing.title);
      const normExistCity = this.normalizeLocation(existing.city || existing.location);

      const compMatch = normIncomingComp.length > 2 && normExistComp.length > 2 && (normIncomingComp === normExistComp || normIncomingComp.includes(normExistComp) || normExistComp.includes(normIncomingComp));
      const titleMatch = normIncomingTitle === normExistTitle || (normIncomingTitle.includes(normExistTitle) && normExistTitle.length > 5);
      const cityMatch = normIncomingCity === normExistCity || normIncomingCity.includes(normExistCity) || normExistCity.includes(normIncomingCity) || normIncomingCity.includes('remote') || normExistCity.includes('remote');

      if (compMatch && titleMatch && cityMatch) {
        return {
          isDuplicate: true,
          existingJob: existing,
          confidence: 0.92,
          reason: `Heuristic match on Company (${existing.companyName}), Role (${existing.title}), and Location (${existing.location})`
        };
      }
    }

    return { isDuplicate: false, confidence: 0 };
  }

  /**
   * Merges newly discovered source into an existing job without duplicating
   */
  public static mergeJobSource(existingJob: Job, newSource: DiscoveredSource): Job {
    const updated = { ...existingJob };
    const sourceExists = updated.discoveredSources.some(
      s => s.sourceName === newSource.sourceName || (s.originalUrl && s.originalUrl === newSource.originalUrl)
    );

    if (!sourceExists) {
      updated.discoveredSources = [...updated.discoveredSources, newSource];
    }

    // If the new source is an official company portal, elevate the canonical apply URL to official
    if (newSource.sourceType === 'COMPANY_PORTAL' || newSource.sourceType === 'OFFICIAL_API') {
      updated.primarySource = newSource.sourceType;
      updated.primarySourceName = newSource.sourceName;
      updated.sourceConfidence = 'OFFICIAL_CAREER_PAGE';
      updated.jobUrl = newSource.originalUrl;
    }

    updated.lastCheckedAt = new Date().toISOString();
    return updated;
  }
}
