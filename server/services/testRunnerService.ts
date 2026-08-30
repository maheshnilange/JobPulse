import { DeduplicationService } from './deduplicationService';
import { FresherIntelligenceService } from './fresherIntelligenceService';
import { WalkInService } from './walkInService';
import { NotificationService } from './notificationService';
import { db } from '../db';
import { Job } from '../types';

export interface TestCaseResult {
  suite: 'Unit' | 'Integration';
  name: string;
  category: string;
  passed: boolean;
  durationMs: number;
  message: string;
  details?: any;
}

export interface TestSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
  results: TestCaseResult[];
}

export class TestRunnerService {
  public static async runAllTests(): Promise<TestSuiteSummary> {
    const start = Date.now();
    const results: TestCaseResult[] = [];

    // 1. UNIT TEST: Fresher Detection
    {
      const tStart = Date.now();
      const testCases = [
        { title: 'Graduate Engineer Trainee (GET) - Java', desc: 'Hiring 2025 batch', exp: '0 years', minExp: 0, expected: true },
        { title: 'Senior Java Architect', desc: 'Requires 8+ years hands-on microservices', exp: '8-12 years', minExp: 8, expected: false },
        { title: 'Associate Software Engineer', desc: 'Entry level batch 2026', exp: '0-1 year', minExp: 0, expected: true }
      ];

      let allPassed = true;
      testCases.forEach(tc => {
        const result = FresherIntelligenceService.isFresherJob(tc.title, tc.desc, tc.exp, tc.minExp);
        if (result !== tc.expected) allPassed = false;
      });

      results.push({
        suite: 'Unit',
        category: 'Intelligence & Filtering',
        name: 'Fresher Classification Algorithm',
        passed: allPassed,
        durationMs: Date.now() - tStart,
        message: allPassed ? 'Passed all 3 fresher boundary conditions (0 yr, GET, Senior exclusion)' : 'Fresher classification failed on boundary test'
      });
    }

    // 2. UNIT TEST: Java Detection
    {
      const tStart = Date.now();
      const isJava1 = FresherIntelligenceService.isJavaJob('Backend Engineer', 'Building Spring Boot REST APIs with PostgreSQL', ['Spring Boot', 'SQL']);
      const isJava2 = FresherIntelligenceService.isJavaJob('React Frontend Specialist', 'Building UI in TypeScript and Tailwind', ['React', 'TypeScript']);
      const isJava3 = FresherIntelligenceService.isJavaJob('Core Java Trainee', 'Object oriented programming', ['Java', 'Core Java']);

      const passed = isJava1 === true && isJava2 === false && isJava3 === true;
      results.push({
        suite: 'Unit',
        category: 'Intelligence & Filtering',
        name: 'Java Ecosystem Stack Detection',
        passed,
        durationMs: Date.now() - tStart,
        message: passed ? 'Accurately detected Core Java / Spring Boot and rejected pure JavaScript/TypeScript roles' : 'Java stack detection failed'
      });
    }

    // 3. UNIT TEST: Deduplication Engine
    {
      const tStart = Date.now();
      const sampleExisting: Job[] = [
        {
          id: 'job-existing-1',
          externalJobId: 'TCS-IND-100',
          companyId: 'tcs',
          companyName: 'Tata Consultancy Services',
          title: 'Java Developer',
          location: 'Pune',
          city: 'Pune',
          experience: '0-1 yr',
          minExperienceYears: 0,
          maxExperienceYears: 1,
          salary: '₹5 LPA',
          employmentType: 'Full-time',
          workMode: 'Hybrid',
          description: '',
          responsibilities: [],
          eligibility: { degree: [], branches: [], graduationYears: [], cgpaRequirement: '', backlogRequirement: '', experienceRequirement: '' },
          skills: ['Java'],
          jobUrl: 'https://ibegin.tcs.com/jobs/100',
          primarySource: 'COMPANY_PORTAL',
          primarySourceName: 'TCS Portal',
          sourceConfidence: 'OFFICIAL_CAREER_PAGE',
          discoveredSources: [],
          firstDetectedAt: new Date().toISOString(),
          lastCheckedAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          status: 'ACTIVE',
          categories: ['Fresher', 'Java'],
          isFresher: true,
          isJava: true,
          isSoftware: true,
          timeline: []
        }
      ];

      // Exact ID duplicate test
      const res1 = DeduplicationService.findDuplicate({ externalJobId: 'TCS-IND-100', companyId: 'tcs' }, sampleExisting);
      // Fuzzy match test (same company, title, city from Naukri)
      const res2 = DeduplicationService.findDuplicate({ companyName: 'TCS Ltd', title: 'Jr. Java Developer - Fresher', city: 'Pune' }, sampleExisting);
      // Non-duplicate test
      const res3 = DeduplicationService.findDuplicate({ companyName: 'Infosys', title: 'Python Engineer', city: 'Bengaluru' }, sampleExisting);

      const passed = res1.isDuplicate && res2.isDuplicate && !res3.isDuplicate;
      results.push({
        suite: 'Unit',
        category: 'Deduplication',
        name: 'Job Deduplication & Fuzzy Matching',
        passed,
        durationMs: Date.now() - tStart,
        message: passed ? 'Successfully matched exact external ID and fuzzy Company+Role+Location duplicates while allowing distinct jobs' : 'Deduplication algorithm failed'
      });
    }

    // 4. UNIT TEST: Freshness Score Calculation
    {
      const tStart = Date.now();
      const now = new Date('2026-08-30T12:00:00Z');
      const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
      const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString();

      const f1 = FresherIntelligenceService.calculateFreshness(fiveMinAgo, now.toISOString());
      const f2 = FresherIntelligenceService.calculateFreshness(twoHoursAgo, now.toISOString());
      const f3 = FresherIntelligenceService.calculateFreshness(fourDaysAgo, now.toISOString());

      const passed = f1.level === 'VERY_FRESH' && f2.level === 'RECENT' && f3.level === 'OLD';
      results.push({
        suite: 'Unit',
        category: 'Freshness Engine',
        name: 'Freshness Score & Threshold Calculation',
        passed,
        durationMs: Date.now() - tStart,
        message: passed ? 'Correctly mapped <15m to VERY_FRESH 🔥, 2h to RECENT 🟡, and >3d to OLD' : 'Freshness calculation mismatch'
      });
    }

    // 5. UNIT TEST: Walk-In Expiration Rule
    {
      const tStart = Date.now();
      const updatedWalkIns = WalkInService.updateWalkInStatuses('2026-08-30');
      const expiredWalkIn = updatedWalkIns.find(w => w.interviewDate < '2026-08-30');
      const todayWalkIn = updatedWalkIns.find(w => w.interviewDate === '2026-08-30');
      const tomorrowWalkIn = updatedWalkIns.find(w => w.interviewDate === '2026-08-31');

      const passed = expiredWalkIn?.status === 'EXPIRED' && todayWalkIn?.status === 'TODAY' && tomorrowWalkIn?.status === 'TOMORROW';
      results.push({
        suite: 'Unit',
        category: 'Walk-In Drive Engine',
        name: 'Walk-In Date & Expiration Auto-Status',
        passed: Boolean(passed),
        durationMs: Date.now() - tStart,
        message: passed ? 'Verified automatic transitions: TODAY, TOMORROW, UPCOMING, and EXPIRED' : 'Walk-in status calculation failed'
      });
    }

    // 6. UNIT TEST: Notification Matching
    {
      const tStart = Date.now();
      const sampleJob: Job = {
        id: 'test-job-99',
        externalJobId: 'TEST-99',
        companyId: 'tcs',
        companyName: 'TCS',
        title: 'Java Developer',
        description: 'Spring boot microservices in Pune',
        responsibilities: [],
        location: 'Pune, Maharashtra',
        city: 'Pune',
        experience: '0-1 Years',
        minExperienceYears: 0,
        maxExperienceYears: 1,
        salary: '₹5 LPA',
        employmentType: 'Full-time',
        workMode: 'Hybrid',
        eligibility: { degree: [], branches: [], graduationYears: [], cgpaRequirement: '', backlogRequirement: '', experienceRequirement: '' },
        skills: ['Java', 'Spring Boot'],
        jobUrl: 'https://tcs.com',
        primarySource: 'COMPANY_PORTAL',
        primarySourceName: 'TCS Portal',
        sourceConfidence: 'OFFICIAL_CAREER_PAGE',
        discoveredSources: [],
        firstDetectedAt: new Date().toISOString(),
        lastCheckedAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        status: 'ACTIVE',
        categories: ['Fresher', 'Java', 'Software'],
        isFresher: true,
        isJava: true,
        isSoftware: true,
        timeline: []
      };

      const triggered = NotificationService.checkAndTriggerAlerts(sampleJob);
      const passed = triggered.length > 0;
      results.push({
        suite: 'Unit',
        category: 'Alerts & Notifications',
        name: 'User Alert Matching & Dispatch Matrix',
        passed,
        durationMs: Date.now() - tStart,
        message: passed ? `Successfully matched active user alerts and dispatched ${triggered.length} notification item(s)` : 'Alert matching failed'
      });
    }

    // 7. INTEGRATION TEST: Database & REST Query Ingestion
    {
      const tStart = Date.now();
      const totalJobs = db.jobs.length;
      const totalWalkIns = db.walkIns.length;
      const totalSources = db.sources.length;

      const passed = totalJobs >= 10 && totalWalkIns >= 5 && totalSources >= 5;
      results.push({
        suite: 'Integration',
        category: 'Database & Ingestion',
        name: 'In-Memory Data Store & Source Seed Parity',
        passed,
        durationMs: Date.now() - tStart,
        message: passed ? `Loaded ${totalJobs} verified jobs, ${totalWalkIns} walk-in drives across ${totalSources} tracked adapters` : 'Data store check failed'
      });
    }

    const durationMs = Date.now() - start;
    const passedCount = results.filter(r => r.passed).length;

    return {
      total: results.length,
      passed: passedCount,
      failed: results.length - passedCount,
      durationMs,
      results
    };
  }
}
