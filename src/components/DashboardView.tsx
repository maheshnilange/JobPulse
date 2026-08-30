import React from 'react';
import { 
  Flame, 
  Sparkles, 
  GraduationCap, 
  Code2, 
  Users, 
  Clock, 
  Building2, 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  Calendar,
  ExternalLink,
  Zap,
  Bookmark
} from 'lucide-react';
import { DashboardStats, Job, WalkInDrive } from '../types';

interface DashboardViewProps {
  stats: DashboardStats | null;
  latestJobs: Job[];
  upcomingWalkIns: WalkInDrive[];
  onSelectJob: (job: Job) => void;
  onSelectWalkIn: (walkin: WalkInDrive) => void;
  onNavigateTab: (tab: string, filterParams?: any) => void;
  onSaveJob: (jobId: string) => void;
  savedJobIds: Set<string>;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  latestJobs,
  upcomingWalkIns,
  onSelectJob,
  onSelectWalkIn,
  onNavigateTab,
  onSaveJob,
  savedJobIds
}) => {
  return (
    <div className="space-y-6 pb-12">
      {/* Live Monitoring Hero Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>20+ IT Portals &amp; Official Feeds Monitored Live</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Instant Fresher &amp; Java Job Discovery
            </h1>
            <p className="text-sm text-slate-300">
              Detecting newly published openings within minutes of being posted across TCS, Infosys, Accenture, Amazon, Deloitte &amp; verified feeds.
            </p>
          </div>

          {/* Quick Filter Combo Shortcuts */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onNavigateTab('jobs', { fresherOnly: true, javaOnly: true, location: 'Pune' })}
              className="px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 flex items-center space-x-1.5 transition-all hover:border-indigo-500/50 shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Fresher + Java + Pune</span>
            </button>
            <button
              onClick={() => onNavigateTab('jobs', { experience: '0-1 Years', softwareOnly: true, location: 'Bengaluru' })}
              className="px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 flex items-center space-x-1.5 transition-all hover:border-indigo-500/50 shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span>0–1 Yrs + SDE + Bengaluru</span>
            </button>
            <button
              onClick={() => onNavigateTab('walkins', { status: 'ALL' })}
              className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-xs font-medium text-amber-300 flex items-center space-x-1.5 transition-all shadow-sm"
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Walk-In Drives ({stats?.walkInDrivesCount || 0})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Core Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Today */}
        <div 
          onClick={() => onNavigateTab('jobs')}
          className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 cursor-pointer hover:border-slate-700 transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Active Jobs</span>
            <Sparkles className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white">{stats?.todayJobsCount || 12}</div>
          <div className="text-[11px] text-slate-400 mt-1">Legitimate openings</div>
        </div>

        {/* New in Last Hour */}
        <div 
          onClick={() => onNavigateTab('jobs', { postedWithin: '1h' })}
          className="bg-slate-900/90 border border-rose-500/30 rounded-xl p-4 cursor-pointer hover:border-rose-500/60 transition-all group relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-16 h-16 bg-rose-500/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between text-rose-400 mb-2">
            <span className="text-xs font-medium flex items-center space-x-1">
              <span>🔥 Last Hour</span>
            </span>
            <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
          </div>
          <div className="text-2xl font-bold text-white">{stats?.newLastHourCount || 3}</div>
          <div className="text-[11px] text-rose-300/80 mt-1">Detected &lt; 60m ago</div>
        </div>

        {/* Java Ecosystem */}
        <div 
          onClick={() => onNavigateTab('java')}
          className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-4 cursor-pointer hover:border-amber-500/60 transition-all group"
        >
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-medium">Java Developer</span>
            <Code2 className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white">{stats?.javaJobsCount || 8}</div>
          <div className="text-[11px] text-amber-300/80 mt-1">Spring Boot / Backend</div>
        </div>

        {/* Fresher / 0-1 Yr */}
        <div 
          onClick={() => onNavigateTab('fresher')}
          className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-4 cursor-pointer hover:border-emerald-500/60 transition-all group"
        >
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-medium">Fresher Roles</span>
            <GraduationCap className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white">{stats?.fresherJobsCount || 10}</div>
          <div className="text-[11px] text-emerald-300/80 mt-1">0–1 Yr / 2025/2026 Batch</div>
        </div>

        {/* Walk-In Drives */}
        <div 
          onClick={() => onNavigateTab('walkins')}
          className="bg-slate-900/90 border border-sky-500/30 rounded-xl p-4 cursor-pointer hover:border-sky-500/60 transition-all group col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between text-sky-400 mb-2">
            <span className="text-xs font-medium">Walk-In Drives</span>
            <Users className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white">{stats?.walkInDrivesCount || 6}</div>
          <div className="text-[11px] text-sky-300/80 mt-1">Pune, Blr, Mumbai, Hyd</div>
        </div>
      </div>

      {/* Main Dual Grid: Latest Detected Feed + Upcoming Walk-Ins */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Latest Detected Jobs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Flame className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-white">Newly Detected Opportunities</h2>
            </div>
            <button
              onClick={() => onNavigateTab('latest')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 font-medium"
            >
              <span>View all new</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {latestJobs.slice(0, 5).map((job) => {
              const isSaved = savedJobIds.has(job.id);

              return (
                <div
                  key={job.id}
                  id={`dashboard-job-card-${job.id}`}
                  onClick={() => onSelectJob(job)}
                  className="bg-slate-900 border border-slate-800/90 hover:border-indigo-500/50 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg group relative"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Freshness Badge */}
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          🔥 {job.firstDetectedAt ? 'NEW' : 'RECENT'}
                        </span>

                        {/* Source Confidence */}
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span>{job.primarySourceName}</span>
                        </span>

                        {/* Work Mode */}
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {job.workMode}
                        </span>
                      </div>

                      {/* Job Title */}
                      <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors">
                        {job.title}
                      </h3>

                      {/* Company & Location */}
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-400">
                        <span className="font-medium text-slate-200 flex items-center space-x-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>{job.companyName}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>{job.location}</span>
                        </span>
                        <span className="text-emerald-400 font-semibold">
                          {job.salary}
                        </span>
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {job.skills.slice(0, 5).map((skill, idx) => (
                          <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60">
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 5 && (
                          <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            +{job.skills.length - 5}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSaveJob(job.id);
                        }}
                        className={`p-2 rounded-lg border transition-colors ${
                          isSaved 
                            ? 'bg-blue-600 text-white border-blue-500' 
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700'
                        }`}
                        title={isSaved ? 'Saved to Tracker' : 'Save Job'}
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>

                      <a
                        href={job.jobUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        onClick={(e) => e.stopPropagation()}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-xs font-medium flex items-center space-x-1 transition-colors"
                      >
                        <span>Apply</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Walk-In Drives Section Preview & Top Companies */}
        <div className="space-y-6">
          {/* Upcoming Walk-In Drives Box */}
          <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">WALK-IN INTERVIEWS</h3>
                  <p className="text-[11px] text-amber-400 font-medium">In-person hiring drives</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('walkins')}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium"
              >
                View all
              </button>
            </div>

            <div className="space-y-3 pt-3">
              {upcomingWalkIns.slice(0, 3).map((w) => (
                <div
                  key={w.id}
                  id={`dashboard-walkin-card-${w.id}`}
                  onClick={() => onSelectWalkIn(w)}
                  className="bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 rounded-lg p-3 cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      w.status === 'TODAY'
                        ? 'bg-rose-500 text-white animate-pulse'
                        : w.status === 'TOMORROW'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}>
                      {w.status === 'TODAY' ? 'TODAY' : w.dayOfWeek}
                    </span>
                    <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{w.interviewDate}</span>
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white hover:text-amber-300 transition-colors line-clamp-1">
                    {w.companyName}
                  </h4>
                  <p className="text-[11px] text-slate-300 line-clamp-1">{w.role}</p>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{w.city}</span>
                    </span>
                    <span className="text-emerald-400 font-medium">{w.salary}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Hiring Tech Giants */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span>Top Hiring IT Companies</span>
              </h3>
              <button
                onClick={() => onNavigateTab('companies')}
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                View 20+
              </button>
            </div>

            <div className="space-y-2 pt-3">
              {stats?.topCompanies?.map((comp, idx) => (
                <div
                  key={idx}
                  onClick={() => onNavigateTab('jobs', { company: comp.company })}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 cursor-pointer transition-colors"
                >
                  <span className="text-xs text-slate-200 font-medium truncate max-w-[180px]">
                    {comp.company}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                    {comp.count} openings
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Tech Locations */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 pb-3 border-b border-slate-800">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>Top Fresher Tech Hubs</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 pt-3">
              {stats?.topLocations?.map((loc, idx) => (
                <button
                  key={idx}
                  onClick={() => onNavigateTab('jobs', { location: loc.location })}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 text-left transition-colors"
                >
                  <span className="text-xs text-slate-300 truncate">{loc.location}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{loc.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
