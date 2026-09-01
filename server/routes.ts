import { Router } from 'express';
import path from 'path';
import * as archiverModule from 'archiver';
import { db } from './db';
import { FresherIntelligenceService } from './services/fresherIntelligenceService';
import { WalkInService } from './services/walkInService';
import { SchedulerService } from './services/schedulerService';
import { GeminiService } from './services/geminiService';
import { TestRunnerService } from './services/testRunnerService';
import { FilterParams, Job, SavedJobItem, UserAlert, NotificationItem } from './types';

export const apiRouter = Router();

// ==================== DASHBOARD STATS ====================
apiRouter.get('/stats', (req, res) => {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const activeJobs = db.jobs.filter(j => j.status === 'ACTIVE');
  const freshInLastHour = activeJobs.filter(j => new Date(j.firstDetectedAt).getTime() >= oneHourAgo);
  const javaJobs = activeJobs.filter(j => j.isJava);
  const fresherJobs = activeJobs.filter(j => j.isFresher);
  const walkIns = WalkInService.getWalkIns();
  const activeWalkIns = walkIns.filter(w => w.status !== 'EXPIRED');

  // Top hiring companies
  const companyCounts: Record<string, number> = {};
  activeJobs.forEach(j => {
    companyCounts[j.companyName] = (companyCounts[j.companyName] || 0) + 1;
  });
  const topCompanies = Object.entries(companyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([company, count]) => ({ company, count }));

  // Top locations
  const locationCounts: Record<string, number> = {};
  activeJobs.forEach(j => {
    locationCounts[j.city || j.location] = (locationCounts[j.city || j.location] || 0) + 1;
  });
  const topLocations = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([location, count]) => ({ location, count }));

  // Common roles
  const roleCounts: Record<string, number> = {};
  activeJobs.forEach(j => {
    const roleCat = j.isJava ? 'Java Developer' : j.isFresher ? 'Graduate Trainee' : 'Software Engineer';
    roleCounts[roleCat] = (roleCounts[roleCat] || 0) + 1;
  });
  const mostCommonRoles = Object.entries(roleCounts).map(([role, count]) => ({ role, count }));

  // Source distribution
  const sourceCounts: Record<string, number> = {};
  activeJobs.forEach(j => {
    sourceCounts[j.primarySourceName] = (sourceCounts[j.primarySourceName] || 0) + 1;
  });
  const sourceDistribution = Object.entries(sourceCounts).map(([source, count]) => ({ source, count }));

  res.json({
    todayJobsCount: activeJobs.length,
    freshJobsCount: activeJobs.filter(j => {
      const f = FresherIntelligenceService.calculateFreshness(j.firstDetectedAt);
      return f.level === 'VERY_FRESH' || f.level === 'FRESH';
    }).length,
    javaJobsCount: javaJobs.length,
    fresherJobsCount: fresherJobs.length,
    walkInDrivesCount: activeWalkIns.length,
    newLastHourCount: freshInLastHour.length,
    topCompanies,
    topLocations,
    mostCommonRoles,
    sourceDistribution
  });
});

// ==================== JOBS ENDPOINTS ====================
apiRouter.get('/jobs', (req, res) => {
  const query = req.query as unknown as FilterParams;
  let list = [...db.jobs];

  // Search filter (keyword, title, company, skills, location, eligibility)
  if (query.search) {
    const s = query.search.toLowerCase();
    list = list.filter(j =>
      j.title.toLowerCase().includes(s) ||
      j.companyName.toLowerCase().includes(s) ||
      j.location.toLowerCase().includes(s) ||
      j.skills.some(sk => sk.toLowerCase().includes(s)) ||
      j.description.toLowerCase().includes(s) ||
      j.eligibility.degree.some(d => d.toLowerCase().includes(s))
    );
  }

  // Category filters
  if (query.category && query.category !== 'all') {
    if (query.category === 'fresher') list = list.filter(j => j.isFresher);
    if (query.category === 'java') list = list.filter(j => j.isJava);
    if (query.category === 'software') list = list.filter(j => j.isSoftware);
    if (query.category === 'qa') list = list.filter(j => j.categories.includes('QA_Testing'));
  }

  if (query.fresherOnly) list = list.filter(j => j.isFresher);
  if (query.javaOnly) list = list.filter(j => j.isJava);
  if (query.softwareOnly) list = list.filter(j => j.isSoftware);

  // Role filter
  if (query.role && query.role !== 'all') {
    list = list.filter(j => j.title.toLowerCase().includes(query.role!.toLowerCase()));
  }

  // Company filter
  if (query.company && query.company !== 'all') {
    list = list.filter(j => j.companyId === query.company || j.companyName.toLowerCase().includes(query.company!.toLowerCase()));
  }

  // Location / City
  if (query.location && query.location !== 'all') {
    list = list.filter(j => j.location.toLowerCase().includes(query.location!.toLowerCase()) || j.city.toLowerCase().includes(query.location!.toLowerCase()));
  }

  // Work Mode
  if (query.workMode && query.workMode !== 'all') {
    list = list.filter(j => j.workMode.toLowerCase() === query.workMode!.toLowerCase());
  }

  // Source filter
  if (query.source && query.source !== 'all') {
    list = list.filter(j => j.primarySource === query.source || j.primarySourceName.toLowerCase().includes(query.source!.toLowerCase()));
  }

  // Technology / Skill
  if (query.technology && query.technology !== 'all') {
    list = list.filter(j => j.skills.some(sk => sk.toLowerCase() === query.technology!.toLowerCase()));
  }

  // Graduation Year
  if (query.graduationYear) {
    const yr = Number(query.graduationYear);
    list = list.filter(j => j.eligibility.graduationYears.includes(yr));
  }

  // Degree
  if (query.degree && query.degree !== 'all') {
    list = list.filter(j => j.eligibility.degree.some(d => d.toLowerCase().includes(query.degree!.toLowerCase())));
  }

  // Freshness / Posted Within filter
  if (query.postedWithin && query.postedWithin !== 'all') {
    const now = Date.now();
    const thresholds: Record<string, number> = {
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '30m': 30 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000
    };
    const maxAge = thresholds[query.postedWithin];
    if (maxAge) {
      list = list.filter(j => (now - new Date(j.firstDetectedAt).getTime()) <= maxAge);
    }
  }

  // Sorting
  const sortBy = query.sortBy || 'newest_detected';
  if (sortBy === 'newest_detected') {
    list.sort((a, b) => new Date(b.firstDetectedAt).getTime() - new Date(a.firstDetectedAt).getTime());
  } else if (sortBy === 'recently_posted') {
    list.sort((a, b) => new Date(b.postedAt || b.firstDetectedAt).getTime() - new Date(a.postedAt || a.firstDetectedAt).getTime());
  } else if (sortBy === 'company') {
    list.sort((a, b) => a.companyName.localeCompare(b.companyName));
  } else if (sortBy === 'salary') {
    list.sort((a, b) => (b.salary || '').localeCompare(a.salary || ''));
  }

  res.json({
    total: list.length,
    jobs: list
  });
});

apiRouter.get('/jobs/latest', (req, res) => {
  const sorted = [...db.jobs].sort((a, b) => new Date(b.firstDetectedAt).getTime() - new Date(a.firstDetectedAt).getTime());
  res.json(sorted.slice(0, 15));
});

apiRouter.get('/jobs/fresher', (req, res) => {
  const fresherList = db.jobs.filter(j => j.isFresher);
  res.json({ total: fresherList.length, jobs: fresherList });
});

apiRouter.get('/jobs/java', (req, res) => {
  const javaList = db.jobs.filter(j => j.isJava);
  res.json({ total: javaList.length, jobs: javaList });
});

apiRouter.get('/jobs/software', (req, res) => {
  const swList = db.jobs.filter(j => j.isSoftware);
  res.json({ total: swList.length, jobs: swList });
});

apiRouter.get('/jobs/:id', (req, res) => {
  const job = db.jobs.find(j => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json(job);
});

apiRouter.post('/jobs/ai-analyze', async (req, res) => {
  const { description } = req.body;
  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }
  const analysis = await GeminiService.analyzeJobDescription(description);
  res.json(analysis);
});

// ==================== WALK-IN DRIVES ENDPOINTS ====================
apiRouter.get('/walkins', (req, res) => {
  const { status, city, search } = req.query as { status?: string; city?: string; search?: string };
  const walkins = WalkInService.getWalkIns({ status, city, search });
  res.json({ total: walkins.length, walkins });
});

apiRouter.get('/walkins/latest', (req, res) => {
  const walkins = WalkInService.getWalkIns().filter(w => w.status !== 'EXPIRED');
  res.json(walkins.slice(0, 10));
});

apiRouter.get('/walkins/:id', (req, res) => {
  WalkInService.updateWalkInStatuses();
  const walkin = db.walkIns.find(w => w.id === req.params.id);
  if (!walkin) {
    return res.status(404).json({ error: 'Walk-in drive not found' });
  }
  res.json(walkin);
});

// ==================== COMPANIES ENDPOINTS ====================
apiRouter.get('/companies', (req, res) => {
  // Update active count dynamically
  const companiesWithCounts = db.companies.map(c => ({
    ...c,
    activeOpeningsCount: db.jobs.filter(j => j.companyId === c.id && j.status === 'ACTIVE').length
  }));
  res.json(companiesWithCounts);
});

apiRouter.get('/companies/:id', (req, res) => {
  const company = db.companies.find(c => c.id === req.params.id);
  if (!company) {
    return res.status(404).json({ error: 'Company not found' });
  }
  const companyJobs = db.jobs.filter(j => j.companyId === company.id && j.status === 'ACTIVE');
  const companyWalkIns = db.walkIns.filter(w => w.companyId === company.id);

  res.json({
    ...company,
    jobs: companyJobs,
    walkIns: companyWalkIns
  });
});

// ==================== ALERTS ENDPOINTS ====================
apiRouter.get('/alerts', (req, res) => {
  res.json(db.alerts);
});

apiRouter.post('/alerts', (req, res) => {
  const { name, keywords, locations, experienceLevels, jobCategories, sources, channels } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Alert name is required' });
  }

  const newAlert: UserAlert = {
    id: `alert-${Date.now()}`,
    name,
    keywords: keywords || [],
    locations: locations || [],
    experienceLevels: experienceLevels || ['Fresher', '0–1 years'],
    jobCategories: jobCategories || ['Fresher', 'Java', 'Software'],
    sources: sources || ['Naukri', 'LinkedIn', 'COMPANY_PORTAL'],
    channels: channels || ['in_app', 'browser'],
    active: true,
    createdAt: new Date().toISOString(),
    matchCount: 0
  };

  db.alerts.unshift(newAlert);
  res.status(201).json(newAlert);
});

apiRouter.put('/alerts/:id', (req, res) => {
  const index = db.alerts.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Alert not found' });
  }
  db.alerts[index] = { ...db.alerts[index], ...req.body };
  res.json(db.alerts[index]);
});

apiRouter.patch('/alerts/:id/toggle', (req, res) => {
  const alert = db.alerts.find(a => a.id === req.params.id);
  if (!alert) {
    return res.status(404).json({ error: 'Alert not found' });
  }
  alert.active = !alert.active;
  res.json(alert);
});

apiRouter.delete('/alerts/:id', (req, res) => {
  const index = db.alerts.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Alert not found' });
  }
  db.alerts.splice(index, 1);
  res.json({ message: 'Alert deleted successfully' });
});

// ==================== NOTIFICATIONS ENDPOINTS ====================
apiRouter.get('/notifications', (req, res) => {
  res.json(db.notifications);
});

apiRouter.patch('/notifications/:id/read', (req, res) => {
  const notif = db.notifications.find(n => n.id === req.params.id);
  if (!notif) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  notif.read = true;
  res.json(notif);
});

apiRouter.post('/notifications/read-all', (req, res) => {
  db.notifications.forEach(n => {
    n.read = true;
  });
  res.json({ message: 'All notifications marked as read' });
});

// ==================== SAVED JOBS & APPLICATION TRACKER ====================
apiRouter.get('/saved', (req, res) => {
  res.json(db.savedJobs);
});

apiRouter.post('/jobs/apply', (req, res) => {
  const { 
    jobId, 
    candidateName, 
    candidateEmail, 
    candidatePhone, 
    candidateDegree, 
    graduationYear, 
    candidateSkills, 
    resumeFileName, 
    coverNote 
  } = req.body;

  const job = db.jobs.find(j => j.id === jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  // Calculate matching score
  const reqSkills = job.skills || [];
  const candSkills = (candidateSkills || ['Java', 'Spring Boot', 'SQL', 'Git', 'REST API']).map((s: string) => s.toLowerCase());
  let matchedCount = 0;
  reqSkills.forEach(sk => {
    if (candSkills.some(cs => sk.toLowerCase().includes(cs) || cs.includes(sk.toLowerCase()))) {
      matchedCount++;
    }
  });
  const matchScore = Math.min(98, Math.max(82, Math.round((matchedCount / Math.max(1, reqSkills.length)) * 100)));

  const applicationId = `APP-${job.companyId.toUpperCase()}-${Date.now().toString().slice(-6)}`;
  const appliedAt = new Date().toISOString();

  // Create or update in db.savedJobs
  const existingIdx = db.savedJobs.findIndex(s => s.jobId === jobId);
  const applicationRecord: SavedJobItem = {
    id: existingIdx !== -1 ? db.savedJobs[existingIdx].id : `save-${Date.now()}`,
    jobId,
    job,
    status: 'Applied',
    notes: coverNote ? `Applied with ${resumeFileName || 'Resume.pdf'}: "${coverNote}"` : `Applied via 1-Click Resume submission (${resumeFileName || 'Resume.pdf'})`,
    savedAt: existingIdx !== -1 ? db.savedJobs[existingIdx].savedAt : appliedAt,
    updatedAt: appliedAt,
    applicationId,
    appliedAt,
    resumeFileName: resumeFileName || 'Candidate_Resume.pdf',
    matchScore
  };

  if (existingIdx !== -1) {
    db.savedJobs[existingIdx] = applicationRecord;
  } else {
    db.savedJobs.unshift(applicationRecord);
  }

  // Generate confirmation notification
  const notif: NotificationItem = {
    id: `notif-app-${Date.now()}`,
    jobId: job.id,
    title: `🎉 Application Dispatched: ${job.companyName}`,
    companyName: job.companyName,
    role: job.title,
    experience: job.experience,
    location: job.location,
    salary: job.salary,
    sourceName: 'Direct 1-Click Resume Apply',
    jobUrl: job.jobUrl,
    detectedAt: appliedAt,
    read: false,
    channelsSent: ['in_app', 'browser']
  };
  db.notifications.unshift(notif);

  res.status(201).json({
    success: true,
    applicationId,
    appliedAt,
    matchScore,
    job,
    savedItem: applicationRecord,
    message: `Application for ${job.title} at ${job.companyName} submitted successfully.`
  });
});

apiRouter.post('/saved', (req, res) => {
  const { jobId, notes, status } = req.body;
  const job = db.jobs.find(j => j.id === jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  const existing = db.savedJobs.find(s => s.jobId === jobId);
  if (existing) {
    existing.notes = notes || existing.notes;
    existing.status = status || existing.status;
    existing.updatedAt = new Date().toISOString();
    return res.json(existing);
  }

  const newSaved: SavedJobItem = {
    id: `save-${Date.now()}`,
    jobId,
    job,
    status: status || 'Saved',
    notes: notes || '',
    savedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.savedJobs.unshift(newSaved);
  res.status(201).json(newSaved);
});

apiRouter.patch('/saved/:id/status', (req, res) => {
  const { status, notes } = req.body;
  const item = db.savedJobs.find(s => s.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Saved job not found' });
  }
  if (status) item.status = status;
  if (notes !== undefined) item.notes = notes;
  item.updatedAt = new Date().toISOString();
  res.json(item);
});

apiRouter.delete('/saved/:id', (req, res) => {
  const index = db.savedJobs.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Saved job not found' });
  }
  db.savedJobs.splice(index, 1);
  res.json({ message: 'Job removed from saved list' });
});

// ==================== ADMIN & MONITORING ENDPOINTS ====================
apiRouter.get('/admin/sources', (req, res) => {
  res.json(db.sources);
});

apiRouter.patch('/admin/sources/:id/toggle', (req, res) => {
  const source = db.sources.find(s => s.id === req.params.id);
  if (!source) {
    return res.status(404).json({ error: 'Source config not found' });
  }
  source.active = !source.active;
  res.json(source);
});

apiRouter.post('/admin/sources/:id/crawl', async (req, res) => {
  const results = await SchedulerService.executeSourceCrawl(req.params.id);
  res.json(results);
});

apiRouter.post('/admin/sources/crawl-all', async (req, res) => {
  const results = await SchedulerService.executeSourceCrawl();
  res.json(results);
});

apiRouter.patch('/admin/jobs/:id/verify', (req, res) => {
  const { status, confidence } = req.body;
  const job = db.jobs.find(j => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  if (status) job.status = status;
  if (confidence) job.sourceConfidence = confidence;
  job.lastUpdatedAt = new Date().toISOString();
  res.json(job);
});

// ==================== TEST RUNNER ENDPOINT ====================
apiRouter.get('/tests/run', async (req, res) => {
  const summary = await TestRunnerService.runAllTests();
  res.json(summary);
});

// ==================== OPENAPI / SWAGGER SPEC ====================
apiRouter.get('/openapi.json', (req, res) => {
  res.json({
    openapi: '3.0.3',
    info: {
      title: 'JobPulse Real-Time Fresher & Software Job Monitoring API',
      version: '1.0.0',
      description: 'Production API specification for JobPulse real-time job detection, walk-in drives aggregation, deduplication engine, and user alerts.'
    },
    paths: {
      '/api/jobs': {
        get: {
          summary: 'List and filter jobs',
          parameters: [
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'category', in: 'query', schema: { type: 'string', enum: ['all', 'fresher', 'java', 'software', 'qa'] } },
            { name: 'location', in: 'query', schema: { type: 'string' } },
            { name: 'postedWithin', in: 'query', schema: { type: 'string', enum: ['5m', '15m', '30m', '1h', '6h', '24h', '7d', 'all'] } },
            { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['newest_detected', 'recently_posted', 'company', 'salary'] } }
          ],
          responses: {
            200: { description: 'Filtered list of jobs with freshness metrics' }
          }
        }
      },
      '/api/walkins': {
        get: {
          summary: 'List separate walk-in interview drives',
          parameters: [
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['ALL', 'TODAY', 'TOMORROW', 'UPCOMING', 'EXPIRED'] } },
            { name: 'city', in: 'query', schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'List of active and upcoming walk-in drives with venue details' }
          }
        }
      },
      '/api/alerts': {
        get: { summary: 'List user job alert configurations' },
        post: { summary: 'Create new real-time alert trigger' }
      },
      '/api/tests/run': {
        get: { summary: 'Run in-app unit and integration test suites' }
      }
    }
  });
});

// ==================== DIRECT ZIP DOWNLOAD ====================
apiRouter.get('/download-zip', (req, res) => {
  res.attachment('jobpulse-source-code.zip');
  
  const mod: any = archiverModule;
  let archive: any;
  if (typeof mod === 'function') {
    archive = mod('zip', { zlib: { level: 9 } });
  } else if (typeof mod.default === 'function') {
    archive = mod.default('zip', { zlib: { level: 9 } });
  } else if (mod.ZipArchive) {
    archive = new mod.ZipArchive({ zlib: { level: 9 } });
  } else if (mod.default?.ZipArchive) {
    archive = new mod.default.ZipArchive({ zlib: { level: 9 } });
  } else {
    archive = new mod({ zlib: { level: 9 } });
  }

  archive.on('error', (err: any) => {
    console.error('Archive error:', err);
    if (!res.headersSent) {
      res.status(500).send({ error: err.message });
    }
  });

  archive.pipe(res);

  const rootDir = process.cwd();

  // Glob all source files excluding large binaries and temporary caches
  archive.glob('**/*', {
    cwd: rootDir,
    ignore: [
      'node_modules/**',
      'node_modules',
      'dist/**',
      'dist',
      '.git/**',
      '.cache/**',
      '.env'
    ],
    dot: true
  });

  archive.finalize();
});

// ==================== WORKSPACE OAUTH AUTH CONFIG ====================
apiRouter.get('/auth/client-id', (req, res) => {
  // Return client id from environment or google oauth client credentials
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';
  res.json({ clientId });
});
