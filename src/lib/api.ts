import { DashboardStats, FilterParams, Job, NotificationItem, SavedJobItem, TestSuiteSummary, UserAlert, WalkInDrive, Company, JobSourceConfig } from '../types';

export const api = {
  // Stats
  getStats: async (): Promise<DashboardStats> => {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  // Jobs
  getJobs: async (params?: FilterParams): Promise<{ total: number; jobs: Job[] }> => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.set(key, String(val));
        }
      });
    }
    const res = await fetch(`/api/jobs?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch jobs');
    return res.json();
  },

  getJobById: async (id: string): Promise<Job> => {
    const res = await fetch(`/api/jobs/${id}`);
    if (!res.ok) throw new Error('Failed to fetch job details');
    return res.json();
  },

  getLatestJobs: async (): Promise<Job[]> => {
    const res = await fetch('/api/jobs/latest');
    if (!res.ok) throw new Error('Failed to fetch latest jobs');
    return res.json();
  },

  analyzeJobWithAI: async (description: string): Promise<{ summary: string; keyHighlights: string[]; interviewTips: string[] }> => {
    const res = await fetch('/api/jobs/ai-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description })
    });
    if (!res.ok) throw new Error('Failed to analyze job with AI');
    return res.json();
  },

  // Walk-Ins
  getWalkIns: async (params?: { status?: string; city?: string; search?: string }): Promise<{ total: number; walkins: WalkInDrive[] }> => {
    const query = new URLSearchParams();
    if (params) {
      if (params.status) query.set('status', params.status);
      if (params.city) query.set('city', params.city);
      if (params.search) query.set('search', params.search);
    }
    const res = await fetch(`/api/walkins?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch walk-in drives');
    return res.json();
  },

  getWalkInById: async (id: string): Promise<WalkInDrive> => {
    const res = await fetch(`/api/walkins/${id}`);
    if (!res.ok) throw new Error('Failed to fetch walk-in drive details');
    return res.json();
  },

  // Companies
  getCompanies: async (): Promise<Company[]> => {
    const res = await fetch('/api/companies');
    if (!res.ok) throw new Error('Failed to fetch companies');
    return res.json();
  },

  getCompanyById: async (id: string): Promise<Company & { jobs: Job[]; walkIns: WalkInDrive[] }> => {
    const res = await fetch(`/api/companies/${id}`);
    if (!res.ok) throw new Error('Failed to fetch company profile');
    return res.json();
  },

  // Alerts
  getAlerts: async (): Promise<UserAlert[]> => {
    const res = await fetch('/api/alerts');
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  },

  createAlert: async (data: Partial<UserAlert>): Promise<UserAlert> => {
    const res = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create alert');
    return res.json();
  },

  toggleAlert: async (id: string): Promise<UserAlert> => {
    const res = await fetch(`/api/alerts/${id}/toggle`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Failed to toggle alert');
    return res.json();
  },

  deleteAlert: async (id: string): Promise<void> => {
    const res = await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete alert');
  },

  // Notifications
  getNotifications: async (): Promise<NotificationItem[]> => {
    const res = await fetch('/api/notifications');
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  markNotificationRead: async (id: string): Promise<NotificationItem> => {
    const res = await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Failed to mark notification as read');
    return res.json();
  },

  markAllNotificationsRead: async (): Promise<void> => {
    const res = await fetch('/api/notifications/read-all', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to mark all as read');
  },

  // Saved Jobs
  getSavedJobs: async (): Promise<SavedJobItem[]> => {
    const res = await fetch('/api/saved');
    if (!res.ok) throw new Error('Failed to fetch saved jobs');
    return res.json();
  },

  applyToJob: async (data: {
    jobId: string;
    candidateName: string;
    candidateEmail: string;
    candidatePhone?: string;
    candidateDegree?: string;
    graduationYear?: number;
    candidateSkills?: string[];
    resumeFileName?: string;
    coverNote?: string;
  }): Promise<{ success: boolean; applicationId: string; appliedAt: string; matchScore: number; job: Job; savedItem: SavedJobItem; message: string }> => {
    const res = await fetch('/api/jobs/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit application');
    }
    return res.json();
  },

  saveJob: async (jobId: string, status = 'Saved', notes = ''): Promise<SavedJobItem> => {
    const res = await fetch('/api/saved', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, status, notes })
    });
    if (!res.ok) throw new Error('Failed to save job');
    return res.json();
  },

  updateSavedJob: async (id: string, status: string, notes?: string): Promise<SavedJobItem> => {
    const res = await fetch(`/api/saved/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes })
    });
    if (!res.ok) throw new Error('Failed to update saved job');
    return res.json();
  },

  removeSavedJob: async (id: string): Promise<void> => {
    const res = await fetch(`/api/saved/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to remove saved job');
  },

  // Admin & Monitoring
  getSourceConfigs: async (): Promise<JobSourceConfig[]> => {
    const res = await fetch('/api/admin/sources');
    if (!res.ok) throw new Error('Failed to fetch source configs');
    return res.json();
  },

  toggleSource: async (id: string): Promise<JobSourceConfig> => {
    const res = await fetch(`/api/admin/sources/${id}/toggle`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Failed to toggle source');
    return res.json();
  },

  triggerCrawl: async (sourceId?: string): Promise<any> => {
    const url = sourceId ? `/api/admin/sources/${sourceId}/crawl` : '/api/admin/sources/crawl-all';
    const res = await fetch(url, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to trigger crawl');
    return res.json();
  },

  verifyJobStatus: async (id: string, status: string, confidence?: string): Promise<Job> => {
    const res = await fetch(`/api/admin/jobs/${id}/verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, confidence })
    });
    if (!res.ok) throw new Error('Failed to verify job status');
    return res.json();
  },

  // Tests
  runTests: async (): Promise<TestSuiteSummary> => {
    const res = await fetch('/api/tests/run');
    if (!res.ok) throw new Error('Failed to run test suite');
    return res.json();
  }
};
