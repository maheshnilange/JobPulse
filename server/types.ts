export type WorkMode = 'Remote' | 'Hybrid' | 'On-site';
export type EmploymentType = 'Full-time' | 'Internship' | 'Contract' | 'Trainee';
export type JobCategory = 'Fresher' | 'Java' | 'Software' | 'QA_Testing' | 'Other';
export type FreshnessLevel = 'VERY_FRESH' | 'FRESH' | 'RECENT' | 'TODAY' | 'PAST_DAYS' | 'OLD';
export type SourceType = 'COMPANY_PORTAL' | 'NAUKRI' | 'LINKEDIN' | 'OFFICIAL_API' | 'PUBLIC_FEED';
export type SourceConfidence = 'OFFICIAL_CAREER_PAGE' | 'VERIFIED_JOB_SOURCE' | 'THIRD_PARTY_SOURCE';
export type WalkInStatus = 'ACTIVE' | 'TODAY' | 'TOMORROW' | 'UPCOMING' | 'EXPIRED' | 'VERIFICATION_REQUIRED';
export type ApplicationStatus = 'Saved' | 'Applied' | 'Assessment' | 'Interview' | 'Rejected' | 'Selected';

export interface Company {
  id: string;
  name: string;
  officialDomain: string;
  careersUrl: string;
  logo: string;
  industry: string;
  verified: boolean;
  activeOpeningsCount: number;
}

export interface DiscoveredSource {
  sourceName: string;
  sourceType: SourceType;
  originalUrl: string;
  postedAt?: string;
  firstSeenAt: string;
  confidence: SourceConfidence;
}

export interface EligibilityCriteria {
  degree: string[];
  branches: string[];
  graduationYears: number[];
  cgpaRequirement: string;
  backlogRequirement: string;
  experienceRequirement: string;
  requiredCertifications?: string[];
  otherCriteria?: string[];
}

export interface JobTimelineEvent {
  stage: 'POSTED_BY_SOURCE' | 'DETECTED_BY_JOBPULSE' | 'PROCESSED_NORMALIZED' | 'DUPLICATE_CHECK_PASSED' | 'ALERT_MATCHED' | 'NOTIFICATION_SENT' | 'LAST_VERIFIED';
  timestamp: string;
  description: string;
  status: 'completed' | 'pending' | 'skipped';
}

export interface Job {
  id: string;
  externalJobId: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  title: string;
  description: string;
  responsibilities: string[];
  location: string;
  city: string;
  experience: string;
  minExperienceYears: number;
  maxExperienceYears: number;
  salary: string;
  employmentType: EmploymentType;
  workMode: WorkMode;
  eligibility: EligibilityCriteria;
  skills: string[];
  jobUrl: string;
  primarySource: SourceType;
  primarySourceName: string;
  sourceConfidence: SourceConfidence;
  discoveredSources: DiscoveredSource[];
  postedAt?: string;
  firstDetectedAt: string;
  lastCheckedAt: string;
  lastUpdatedAt: string;
  status: 'ACTIVE' | 'EXPIRED' | 'INVALID';
  categories: JobCategory[];
  isFresher: boolean;
  isJava: boolean;
  isSoftware: boolean;
  timeline: JobTimelineEvent[];
  isDemoData?: boolean;
}

export interface WalkInDrive {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  role: string;
  experience: string;
  minExperienceYears: number;
  maxExperienceYears: number;
  location: string;
  city: string;
  venue: string;
  interviewDate: string; // YYYY-MM-DD
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  salary: string;
  eligibility: string;
  skills: string[];
  registrationRequired: boolean;
  registrationUrl?: string;
  sourceUrl: string;
  sourceName: string;
  sourceConfidence: SourceConfidence;
  lastVerifiedAt: string;
  status: WalkInStatus;
  openingsCount?: number;
  contactInfo?: string;
  requiredDocuments: string[];
  dressCode?: string;
  isDemoData?: boolean;
}

export interface JobSourceConfig {
  id: string;
  name: string;
  sourceUrl: string;
  sourceType: SourceType;
  pollingIntervalMinutes: number;
  active: boolean;
  lastCheckedAt?: string;
  lastSuccessAt?: string;
  status: 'HEALTHY' | 'ERROR' | 'PAUSED' | 'RATE_LIMITED';
  successCount: number;
  errorCount: number;
  lastErrorMessage?: string;
  totalJobsDetected: number;
}

export interface UserAlert {
  id: string;
  name: string;
  keywords: string[];
  locations: string[];
  experienceLevels: string[];
  jobCategories: JobCategory[];
  sources: string[];
  channels: ('in_app' | 'browser' | 'email' | 'telegram' | 'discord')[];
  active: boolean;
  createdAt: string;
  lastTriggeredAt?: string;
  matchCount: number;
}

export interface NotificationItem {
  id: string;
  alertId?: string;
  jobId: string;
  title: string;
  companyName: string;
  role: string;
  experience: string;
  location: string;
  salary: string;
  sourceName: string;
  jobUrl: string;
  detectedAt: string;
  read: boolean;
  channelsSent: string[];
}

export interface SavedJobItem {
  id: string;
  jobId: string;
  job: Job;
  status: ApplicationStatus;
  notes: string;
  savedAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  todayJobsCount: number;
  freshJobsCount: number;
  javaJobsCount: number;
  fresherJobsCount: number;
  walkInDrivesCount: number;
  newLastHourCount: number;
  topCompanies: { company: string; count: number; logo?: string }[];
  topLocations: { location: string; count: number }[];
  mostCommonRoles: { role: string; count: number }[];
  sourceDistribution: { source: string; count: number }[];
}

export interface FilterParams {
  search?: string;
  category?: 'all' | 'fresher' | 'java' | 'software' | 'qa';
  role?: string;
  company?: string;
  location?: string;
  workMode?: string;
  experience?: string;
  salary?: string;
  graduationYear?: number;
  degree?: string;
  technology?: string;
  source?: string;
  postedWithin?: '5m' | '15m' | '30m' | '1h' | '6h' | '24h' | '7d' | 'all';
  fresherOnly?: boolean;
  javaOnly?: boolean;
  softwareOnly?: boolean;
  sortBy?: 'newest_detected' | 'recently_posted' | 'company' | 'salary';
}
