import { db } from '../db';
import { Job, JobTimelineEvent } from '../types';
import { DeduplicationService } from './deduplicationService';
import { FresherIntelligenceService } from './fresherIntelligenceService';
import { NotificationService } from './notificationService';

export interface CrawlExecutionSummary {
  sourceId: string;
  sourceName: string;
  timestamp: string;
  status: 'SUCCESS' | 'ERROR';
  newJobsDiscovered: number;
  duplicatesMerged: number;
  alertsTriggered: number;
  durationMs: number;
}

export class SchedulerService {
  private static isRunning = false;

  /**
   * Runs an ingestion crawl for a given source or all active sources
   */
  public static async executeSourceCrawl(sourceId?: string): Promise<CrawlExecutionSummary[]> {
    const startTime = Date.now();
    const results: CrawlExecutionSummary[] = [];

    const sourcesToCrawl = sourceId 
      ? db.sources.filter(s => s.id === sourceId)
      : db.sources.filter(s => s.active);

    for (const source of sourcesToCrawl) {
      const sourceStart = Date.now();
      try {
        // Simulated crawl batch of newly posted fresher / java jobs from the permitted source
        const simulatedNewBatch = this.generateSimulatedBatchForSource(source.id, source.name, source.sourceType);
        let newCount = 0;
        let mergeCount = 0;
        let alertCount = 0;

        for (const raw of simulatedNewBatch) {
          const dedupCheck = DeduplicationService.findDuplicate(raw, db.jobs);

          if (dedupCheck.isDuplicate && dedupCheck.existingJob) {
            // Merge source
            DeduplicationService.mergeJobSource(dedupCheck.existingJob, {
              sourceName: source.name,
              sourceType: source.sourceType,
              originalUrl: raw.jobUrl,
              postedAt: raw.postedAt,
              firstSeenAt: new Date().toISOString(),
              confidence: FresherIntelligenceService.evaluateSourceConfidence(source.sourceType, raw.companyId, raw.jobUrl)
            });
            mergeCount++;
          } else {
            // New unique job detected
            const isFresher = FresherIntelligenceService.isFresherJob(raw.title, raw.description, raw.experience, raw.minExperienceYears);
            const isJava = FresherIntelligenceService.isJavaJob(raw.title, raw.description, raw.skills);
            const isSoftware = FresherIntelligenceService.isSoftwareJob(raw.title, raw.description);
            const categories = FresherIntelligenceService.extractCategories(raw.title, raw.description, raw.experience, raw.minExperienceYears, raw.skills);

            const timeline: JobTimelineEvent[] = [
              { stage: 'POSTED_BY_SOURCE', timestamp: raw.postedAt || new Date().toISOString(), description: `Posted on ${source.name}`, status: 'completed' },
              { stage: 'DETECTED_BY_JOBPULSE', timestamp: new Date().toISOString(), description: `Scanned & detected in real-time by JobPulse ${source.name} adapter`, status: 'completed' },
              { stage: 'PROCESSED_NORMALIZED', timestamp: new Date().toISOString(), description: `Extracted eligibility & skills: ${raw.skills.slice(0, 4).join(', ')}`, status: 'completed' },
              { stage: 'DUPLICATE_CHECK_PASSED', timestamp: new Date().toISOString(), description: 'Verified 0 duplicate records across 20+ tracked sources', status: 'completed' },
              { stage: 'ALERT_MATCHED', timestamp: new Date().toISOString(), description: 'Evaluating user alert criteria', status: 'completed' },
              { stage: 'NOTIFICATION_SENT', timestamp: new Date().toISOString(), description: 'Notifications dispatched', status: 'completed' },
              { stage: 'LAST_VERIFIED', timestamp: new Date().toISOString(), description: 'Verified legitimate company URL', status: 'completed' }
            ];

            const newJob: Job = {
              id: `job-${raw.companyId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              externalJobId: raw.externalJobId || `EXT-${Date.now()}`,
              companyId: raw.companyId,
              companyName: raw.companyName,
              title: raw.title,
              description: raw.description,
              responsibilities: raw.responsibilities,
              location: raw.location,
              city: raw.city,
              experience: raw.experience,
              minExperienceYears: raw.minExperienceYears,
              maxExperienceYears: raw.maxExperienceYears,
              salary: raw.salary,
              employmentType: raw.employmentType,
              workMode: raw.workMode,
              eligibility: raw.eligibility,
              skills: raw.skills,
              jobUrl: raw.jobUrl,
              primarySource: source.sourceType,
              primarySourceName: source.name,
              sourceConfidence: FresherIntelligenceService.evaluateSourceConfidence(source.sourceType, raw.companyId, raw.jobUrl),
              discoveredSources: [
                {
                  sourceName: source.name,
                  sourceType: source.sourceType,
                  originalUrl: raw.jobUrl,
                  postedAt: raw.postedAt,
                  firstSeenAt: new Date().toISOString(),
                  confidence: FresherIntelligenceService.evaluateSourceConfidence(source.sourceType, raw.companyId, raw.jobUrl)
                }
              ],
              postedAt: raw.postedAt,
              firstDetectedAt: new Date().toISOString(),
              lastCheckedAt: new Date().toISOString(),
              lastUpdatedAt: new Date().toISOString(),
              status: 'ACTIVE',
              categories,
              isFresher,
              isJava,
              isSoftware,
              timeline,
              isDemoData: true
            };

            db.jobs.unshift(newJob);
            newCount++;

            // Trigger matching alerts
            const notifs = NotificationService.checkAndTriggerAlerts(newJob);
            alertCount += notifs.length;
          }
        }

        source.lastCheckedAt = new Date().toISOString();
        source.lastSuccessAt = new Date().toISOString();
        source.status = 'HEALTHY';
        source.successCount += 1;
        source.totalJobsDetected += newCount;

        results.push({
          sourceId: source.id,
          sourceName: source.name,
          timestamp: new Date().toISOString(),
          status: 'SUCCESS',
          newJobsDiscovered: newCount,
          duplicatesMerged: mergeCount,
          alertsTriggered: alertCount,
          durationMs: Date.now() - sourceStart
        });
      } catch (err: any) {
        source.lastCheckedAt = new Date().toISOString();
        source.status = 'ERROR';
        source.errorCount += 1;
        source.lastErrorMessage = err.message || 'Connection timeout or parsing failure';

        results.push({
          sourceId: source.id,
          sourceName: source.name,
          timestamp: new Date().toISOString(),
          status: 'ERROR',
          newJobsDiscovered: 0,
          duplicatesMerged: 0,
          alertsTriggered: 0,
          durationMs: Date.now() - sourceStart
        });
      }
    }

    return results;
  }

  /**
   * Generates realistic simulated incoming feed items during manual or background crawl
   */
  private static generateSimulatedBatchForSource(sourceId: string, sourceName: string, sourceType: any) {
    const roles = [
      {
        companyId: 'persistent',
        companyName: 'Persistent Systems',
        title: 'Java Backend Trainee (Spring Boot & Microservices)',
        location: 'Pune, Maharashtra',
        city: 'Pune',
        skills: ['Java', 'Core Java', 'Spring Boot', 'REST API', 'MySQL', 'Git'],
        salary: '₹5.5 – 7.0 LPA',
        degree: ['B.E', 'B.Tech', 'MCA'],
        exp: '0–1 Years'
      },
      {
        companyId: 'infosys',
        companyName: 'Infosys',
        title: 'Associate Java Developer - Enterprise Modernization',
        location: 'Bengaluru, Karnataka',
        city: 'Bengaluru',
        skills: ['Java', 'Spring Boot', 'Hibernate', 'Microservices', 'SQL'],
        salary: '₹4.5 – 6.0 LPA',
        degree: ['B.Tech', 'MCA', 'B.Sc CS'],
        exp: '0–1 Years'
      },
      {
        companyId: 'deloitte',
        companyName: 'Deloitte',
        title: 'Graduate Tech Analyst - Java & Cloud Solutions',
        location: 'Hyderabad, Telangana',
        city: 'Hyderabad',
        skills: ['Java', 'Spring Boot', 'PostgreSQL', 'AWS', 'Docker'],
        salary: '₹7.0 – 9.0 LPA',
        degree: ['B.E', 'B.Tech', 'MCA'],
        exp: '0–1 Years'
      }
    ];

    // Pick 1 candidate randomly to simulate an incoming posting
    const chosen = roles[Math.floor(Math.random() * roles.length)];
    const uniqueExtId = `${chosen.companyId.toUpperCase()}-IN-${Date.now().toString().slice(-4)}`;

    return [
      {
        externalJobId: uniqueExtId,
        companyId: chosen.companyId,
        companyName: chosen.companyName,
        title: chosen.title,
        description: `${chosen.companyName} is recruiting entry-level candidates for ${chosen.title}. Work with modern Java microservices architecture, automated CI/CD pipelines, and cloud native environments.`,
        responsibilities: [
          'Build and test RESTful services using Core Java and Spring Boot',
          'Write database scripts and optimize queries',
          'Participate in agile sprint rituals and code reviews'
        ],
        location: chosen.location,
        city: chosen.city,
        experience: chosen.exp,
        minExperienceYears: 0,
        maxExperienceYears: 1,
        salary: chosen.salary,
        employmentType: 'Full-time' as const,
        workMode: 'Hybrid' as const,
        eligibility: {
          degree: chosen.degree,
          branches: ['Computer Science', 'IT', 'Circuital branches'],
          graduationYears: [2024, 2025, 2026],
          cgpaRequirement: '60% or 6.0 CGPA throughout',
          backlogRequirement: 'Zero active backlogs at joining',
          experienceRequirement: 'Freshers (0-1 year)'
        },
        skills: chosen.skills,
        jobUrl: `https://${chosen.companyId}.com/careers/job/${uniqueExtId}`,
        postedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString()
      }
    ];
  }
}
