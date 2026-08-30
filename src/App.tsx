import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { JobsListView } from './components/JobsListView';
import { WalkInDrivesView } from './components/WalkInDrivesView';
import { JobDetailModal } from './components/JobDetailModal';
import { AdvancedFilterDrawer } from './components/AdvancedFilterDrawer';
import { AlertsManagerView } from './components/AlertsManagerView';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { SavedJobsTrackerView } from './components/SavedJobsTrackerView';
import { CompaniesDirectoryView } from './components/CompaniesDirectoryView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { ApiDocsAndTestsView } from './components/ApiDocsAndTestsView';
import { api } from './lib/api';
import { 
  Company, 
  DashboardStats, 
  FilterParams, 
  Job, 
  JobSourceConfig, 
  NotificationItem, 
  SavedJobItem, 
  UserAlert, 
  WalkInDrive 
} from './types';
import { Bell, Flame, Sparkles } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterParams, setFilterParams] = useState<FilterParams>({});

  // Data States
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalJobs, setTotalJobs] = useState<number>(0);
  const [latestJobs, setLatestJobs] = useState<Job[]>([]);
  const [walkIns, setWalkIns] = useState<WalkInDrive[]>([]);
  const [totalWalkIns, setTotalWalkIns] = useState<number>(0);
  const [walkInStatusFilter, setWalkInStatusFilter] = useState<string>('ALL');
  const [walkInCityFilter, setWalkInCityFilter] = useState<string>('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [alerts, setAlerts] = useState<UserAlert[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJobItem[]>([]);
  const [sources, setSources] = useState<JobSourceConfig[]>([]);

  // UI Modal / Drawer States
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isCrawling, setIsCrawling] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; jobId?: string } | null>(null);

  // Set of saved job IDs for fast O(1) checks
  const savedJobIds = new Set(savedJobs.map(s => s.jobId));

  // 1. Initial Load of Global Data
  const loadInitialData = useCallback(async () => {
    try {
      const [statsData, compData, alertsData, notifsData, savedData, sourcesData, latestJobsData] = await Promise.all([
        api.getStats(),
        api.getCompanies(),
        api.getAlerts(),
        api.getNotifications(),
        api.getSavedJobs(),
        api.getSourceConfigs(),
        api.getLatestJobs()
      ]);

      setStats(statsData);
      setCompanies(compData);
      setAlerts(alertsData);
      setNotifications(notifsData);
      setSavedJobs(savedData);
      setSources(sourcesData);
      setLatestJobs(latestJobsData);
    } catch (err) {
      console.error('Error loading initial data:', err);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // 2. Fetch Jobs based on tab and filters
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const mergedParams: FilterParams = {
        ...filterParams,
        search: searchQuery || filterParams.search
      };

      if (activeTab === 'fresher') mergedParams.fresherOnly = true;
      if (activeTab === 'java') mergedParams.javaOnly = true;
      if (activeTab === 'software') mergedParams.softwareOnly = true;
      if (activeTab === 'latest') mergedParams.sortBy = 'newest_detected';

      const data = await api.getJobs(mergedParams);
      setJobs(data.jobs);
      setTotalJobs(data.total);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, filterParams, searchQuery]);

  useEffect(() => {
    if (['dashboard', 'jobs', 'latest', 'fresher', 'java', 'software'].includes(activeTab)) {
      fetchJobs();
    }
  }, [activeTab, filterParams, searchQuery, fetchJobs]);

  // 3. Fetch Walk-Ins
  const fetchWalkIns = useCallback(async () => {
    try {
      const data = await api.getWalkIns({
        status: walkInStatusFilter === 'ALL' ? undefined : walkInStatusFilter,
        city: walkInCityFilter || undefined
      });
      setWalkIns(data.walkins);
      setTotalWalkIns(data.total);
    } catch (err) {
      console.error('Failed to fetch walk-ins:', err);
    }
  }, [walkInStatusFilter, walkInCityFilter]);

  useEffect(() => {
    fetchWalkIns();
  }, [fetchWalkIns]);

  // 4. Trigger Ingestion Crawl Handler
  const handleTriggerCrawl = async (sourceId?: string) => {
    setIsCrawling(true);
    try {
      const res = await api.triggerCrawl(sourceId);
      await loadInitialData();
      await fetchJobs();
      await fetchWalkIns();

      // Show toast if new jobs were detected
      const totalNew = Array.isArray(res) ? res.reduce((acc, curr) => acc + curr.newJobsDiscovered, 0) : 0;
      if (totalNew > 0) {
        setToastMessage({
          title: `🔥 ${totalNew} New Job(s) Detected!`,
          desc: 'Fresh postings ingested and evaluated against active alert rules.'
        });
        setTimeout(() => setToastMessage(null), 5000);
      }
      return res;
    } catch (err) {
      console.error('Crawl execution error:', err);
    } finally {
      setIsCrawling(false);
    }
  };

  // 5. Job Bookmark / Save Handler
  const handleSaveJob = async (jobId: string) => {
    try {
      if (savedJobIds.has(jobId)) {
        const item = savedJobs.find(s => s.jobId === jobId);
        if (item) {
          await api.removeSavedJob(item.id);
          setSavedJobs(prev => prev.filter(s => s.id !== item.id));
        }
      } else {
        const newSaved = await api.saveJob(jobId);
        setSavedJobs(prev => [newSaved, ...prev]);
      }
    } catch (err) {
      console.error('Error toggling saved job:', err);
    }
  };

  // 6. Alert Handlers
  const handleCreateAlert = async (data: Partial<UserAlert>) => {
    try {
      const newAlert = await api.createAlert(data);
      setAlerts(prev => [newAlert, ...prev]);
    } catch (err) {
      console.error('Error creating alert:', err);
    }
  };

  const handleToggleAlert = async (id: string) => {
    try {
      const updated = await api.toggleAlert(id);
      setAlerts(prev => prev.map(a => a.id === id ? updated : a));
    } catch (err) {
      console.error('Error toggling alert:', err);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      await api.deleteAlert(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error deleting alert:', err);
    }
  };

  // 7. Notification Handlers
  const handleMarkNotifRead = async (id: string) => {
    try {
      const updated = await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? updated : n));
    } catch (err) {
      console.error('Error marking notif read:', err);
    }
  };

  const handleMarkAllNotifsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all notifs read:', err);
    }
  };

  const handleSelectJobById = async (jobId: string) => {
    try {
      const job = await api.getJobById(jobId);
      setSelectedJob(job);
      setIsNotifDrawerOpen(false);
    } catch (err) {
      console.error('Error loading job by id:', err);
    }
  };

  // Quick navigation helper
  const handleNavigateWithFilters = (tab: string, params?: FilterParams) => {
    if (params) setFilterParams(params);
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification Alert Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-rose-500/50 shadow-2xl rounded-xl p-4 flex items-center space-x-3 text-xs max-w-sm animate-in slide-in-from-bottom duration-300">
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-white">{toastMessage.title}</div>
            <div className="text-slate-300 mt-0.5">{toastMessage.desc}</div>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        notifications={notifications}
        savedJobs={savedJobs}
        onOpenNotifications={() => setIsNotifDrawerOpen(true)}
        onOpenFilterDrawer={() => setIsFilterDrawerOpen(true)}
        onTriggerCrawl={() => handleTriggerCrawl()}
        isCrawling={isCrawling}
      />

      {/* Main Tab Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (['dashboard', 'jobs', 'latest', 'fresher', 'java', 'software', 'walkins'].includes(tab)) {
            // Keep parameters smooth
          }
        }}
        todayCount={stats?.todayJobsCount}
        walkInCount={stats?.walkInDrivesCount}
        fresherCount={stats?.fresherJobsCount}
        javaCount={stats?.javaJobsCount}
      />

      {/* Main Container Viewport */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            latestJobs={latestJobs}
            upcomingWalkIns={walkIns}
            onSelectJob={(job) => setSelectedJob(job)}
            onSelectWalkIn={() => setActiveTab('walkins')}
            onNavigateTab={handleNavigateWithFilters}
            onSaveJob={handleSaveJob}
            savedJobIds={savedJobIds}
          />
        )}

        {['latest', 'fresher', 'java', 'software', 'jobs'].includes(activeTab) && (
          <JobsListView
            title={
              activeTab === 'latest' ? '🔥 Newly Detected Opportunities (Fastest Ingestion)' :
              activeTab === 'fresher' ? '🎓 Fresher & 0–1 Year Experience Jobs' :
              activeTab === 'java' ? '☕ Java, Spring Boot & Backend Openings' :
              activeTab === 'software' ? '💻 Software Engineering & Developer Roles' :
              'All Active Verified Job Openings'
            }
            subtitle={
              activeTab === 'latest' ? 'Jobs captured within minutes of being posted across top enterprise portals' :
              activeTab === 'fresher' ? 'Tailored for 2024, 2025, and 2026 graduation batches and entry-level talent' :
              activeTab === 'java' ? 'Core Java, Spring Boot, Microservices, Hibernate, REST APIs & SQL positions' :
              'Comprehensive aggregator of verified software development positions'
            }
            jobs={jobs}
            totalCount={totalJobs}
            loading={loading}
            filterParams={filterParams}
            setFilterParams={setFilterParams}
            onSelectJob={(job) => setSelectedJob(job)}
            onOpenFilterDrawer={() => setIsFilterDrawerOpen(true)}
            onSaveJob={handleSaveJob}
            savedJobIds={savedJobIds}
            onRefresh={fetchJobs}
          />
        )}

        {activeTab === 'walkins' && (
          <WalkInDrivesView
            walkIns={walkIns}
            totalCount={totalWalkIns}
            loading={loading}
            selectedStatus={walkInStatusFilter}
            setSelectedStatus={setWalkInStatusFilter}
            selectedCity={walkInCityFilter}
            setSelectedCity={setWalkInCityFilter}
            onRefresh={fetchWalkIns}
          />
        )}

        {activeTab === 'companies' && (
          <CompaniesDirectoryView
            companies={companies}
            onSelectCompany={(compName) => {
              setFilterParams({ company: compName });
              setActiveTab('jobs');
            }}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsManagerView
            alerts={alerts}
            onCreateAlert={handleCreateAlert}
            onToggleAlert={handleToggleAlert}
            onDeleteAlert={handleDeleteAlert}
          />
        )}

        {activeTab === 'saved' && (
          <SavedJobsTrackerView
            savedJobs={savedJobs}
            onUpdateStatus={async (id, status, notes) => {
              const updated = await api.updateSavedJob(id, status, notes);
              setSavedJobs(prev => prev.map(s => s.id === id ? updated : s));
            }}
            onRemove={async (id) => {
              await api.removeSavedJob(id);
              setSavedJobs(prev => prev.filter(s => s.id !== id));
            }}
            onSelectJob={(job) => setSelectedJob(job)}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboardView
            sources={sources}
            jobs={jobs}
            onToggleSource={async (id) => {
              const updated = await api.toggleSource(id);
              setSources(prev => prev.map(s => s.id === id ? updated : s));
            }}
            onTriggerCrawl={handleTriggerCrawl}
            onVerifyJobStatus={async (id, status, confidence) => {
              const updated = await api.verifyJobStatus(id, status, confidence);
              setJobs(prev => prev.map(j => j.id === id ? updated : j));
            }}
          />
        )}

        {activeTab === 'api-tests' && (
          <ApiDocsAndTestsView />
        )}
      </main>

      {/* Modals & Slide-over Drawers */}
      <JobDetailModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onSaveJob={handleSaveJob}
        isSaved={selectedJob ? savedJobIds.has(selectedJob.id) : false}
      />

      <AdvancedFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={filterParams}
        setFilters={setFilterParams}
      />

      <NotificationsDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotifRead}
        onMarkAllRead={handleMarkAllNotifsRead}
        onSelectJobById={handleSelectJobById}
      />
    </div>
  );
}

export default App;
