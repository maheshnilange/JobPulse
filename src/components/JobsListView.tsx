import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Bookmark, 
  ExternalLink, 
  SlidersHorizontal, 
  LayoutList, 
  LayoutGrid, 
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCw
} from 'lucide-react';
import { Job, FilterParams } from '../types';

interface JobsListViewProps {
  title: string;
  subtitle: string;
  jobs: Job[];
  totalCount: number;
  loading: boolean;
  filterParams: FilterParams;
  setFilterParams: React.Dispatch<React.SetStateAction<FilterParams>>;
  onSelectJob: (job: Job) => void;
  onOpenFilterDrawer: () => void;
  onSaveJob: (jobId: string) => void;
  savedJobIds: Set<string>;
  onRefresh: () => void;
  onDirectApply?: (job: Job) => void;
}

export const JobsListView: React.FC<JobsListViewProps> = ({
  title,
  subtitle,
  jobs,
  totalCount,
  loading,
  filterParams,
  setFilterParams,
  onSelectJob,
  onOpenFilterDrawer,
  onSaveJob,
  savedJobIds,
  onRefresh,
  onDirectApply
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  // Helper to calculate exact badge
  const getFreshnessBadge = (firstDetectedAt: string) => {
    const detected = new Date(firstDetectedAt).getTime();
    const now = Date.now();
    const minAgo = Math.floor(Math.max(0, now - detected) / (1000 * 60));

    if (minAgo < 15) {
      return {
        label: minAgo <= 1 ? '🔥 JUST NOW' : `🔥 ${minAgo} MIN AGO`,
        classes: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse font-bold'
      };
    } else if (minAgo < 60) {
      return {
        label: `🟢 ${minAgo} MIN AGO`,
        classes: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-semibold'
      };
    } else if (minAgo < 360) {
      const hrs = Math.floor(minAgo / 60);
      return {
        label: `🟡 ${hrs} HR AGO`,
        classes: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      };
    } else {
      return {
        label: '🔵 TODAY',
        classes: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      };
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* View Header & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-xl p-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
              {totalCount} Found
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh */}
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title="Refresh Feed"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          {/* Sort By Dropdown */}
          <select
            id="job-sort-select"
            value={filterParams.sortBy || 'newest_detected'}
            onChange={(e) => setFilterParams(prev => ({ ...prev, sortBy: e.target.value as any }))}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="newest_detected">⚡ Newest Detected First</option>
            <option value="recently_posted">📅 Recently Posted by Source</option>
            <option value="company">🏢 Company Name (A-Z)</option>
            <option value="salary">💰 Highest Salary Package</option>
          </select>

          {/* Advanced Filter Trigger */}
          <button
            id="filter-drawer-open-btn"
            onClick={onOpenFilterDrawer}
            className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-xs font-medium text-indigo-300 flex items-center space-x-1.5 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          {/* Table / Card Toggle */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Table View (Full Details)"
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'card' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Card View (Compact)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Quick Filters Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400">Quick Filters:</span>
        <button
          onClick={() => setFilterParams(prev => ({ ...prev, fresherOnly: !prev.fresherOnly }))}
          className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
            filterParams.fresherOnly
              ? 'bg-emerald-600 text-white border-emerald-500 font-semibold'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
          }`}
        >
          🎓 Freshers (0–1 Yr)
        </button>
        <button
          onClick={() => setFilterParams(prev => ({ ...prev, javaOnly: !prev.javaOnly }))}
          className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
            filterParams.javaOnly
              ? 'bg-amber-600 text-white border-amber-500 font-semibold'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
          }`}
        >
          ☕ Java &amp; Spring Boot
        </button>
        <button
          onClick={() => setFilterParams(prev => ({ ...prev, softwareOnly: !prev.softwareOnly }))}
          className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
            filterParams.softwareOnly
              ? 'bg-indigo-600 text-white border-indigo-500 font-semibold'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
          }`}
        >
          💻 Software Engineer
        </button>
        <button
          onClick={() => setFilterParams(prev => ({ ...prev, postedWithin: prev.postedWithin === '1h' ? 'all' : '1h' }))}
          className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
            filterParams.postedWithin === '1h'
              ? 'bg-rose-600 text-white border-rose-500 font-semibold'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
          }`}
        >
          🔥 Last 1 Hour
        </button>
      </div>

      {/* Zero State */}
      {jobs.length === 0 && !loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Matching Jobs Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your search criteria, clearing specific filters, or checking back soon as the system monitors feeds continuously.
          </p>
          <button
            onClick={() => setFilterParams({})}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* TABLE VIEW (Requested in Prompt Section 3) */}
      {viewMode === 'table' && jobs.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table id="main-jobs-table" className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Status / New</th>
                  <th className="py-3 px-3">Company</th>
                  <th className="py-3 px-3">Job Role</th>
                  <th className="py-3 px-3">Experience</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Salary</th>
                  <th className="py-3 px-3">Eligibility</th>
                  <th className="py-3 px-3">Skills</th>
                  <th className="py-3 px-3">Source</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {jobs.map((job) => {
                  const badge = getFreshnessBadge(job.firstDetectedAt);
                  const isSaved = savedJobIds.has(job.id);

                  return (
                    <tr
                      key={job.id}
                      id={`job-row-${job.id}`}
                      onClick={() => onSelectJob(job)}
                      className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    >
                      {/* Freshness Badge */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] border ${badge.classes}`}>
                          {badge.label}
                        </span>
                      </td>

                      {/* Company Name & Verification */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5 font-bold text-white group-hover:text-indigo-300 transition-colors">
                          <span>{job.companyName}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" title="Verified Employer" />
                        </div>
                      </td>

                      {/* Job Role */}
                      <td className="py-3.5 px-3 min-w-[200px]">
                        <div className="font-semibold text-slate-100 line-clamp-1">{job.title}</div>
                        <div className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5">
                          <span className="px-1 py-0.2 rounded bg-slate-800 text-slate-300">{job.workMode}</span>
                          <span>•</span>
                          <span>{job.employmentType}</span>
                        </div>
                      </td>

                      {/* Experience */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-slate-300 font-medium">
                        {job.experience}
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-slate-300">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{job.city || job.location}</span>
                        </div>
                      </td>

                      {/* Salary */}
                      <td className="py-3.5 px-3 whitespace-nowrap font-semibold text-emerald-400">
                        {job.salary}
                      </td>

                      {/* Eligibility Preview */}
                      <td className="py-3.5 px-3 max-w-[180px] truncate text-[11px] text-slate-400" title={job.eligibility?.cgpaRequirement}>
                        {job.eligibility?.degree?.slice(0, 2).join('/')} ({job.eligibility?.graduationYears?.slice(0, 2).join(',')})
                      </td>

                      {/* Skills Chips */}
                      <td className="py-3.5 px-3 max-w-[200px]">
                        <div className="flex flex-wrap gap-1">
                          {job.skills.slice(0, 3).map((sk, idx) => (
                            <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                              {sk}
                            </span>
                          ))}
                          {job.skills.length > 3 && (
                            <span className="text-[10px] text-slate-500">+{job.skills.length - 3}</span>
                          )}
                        </div>
                      </td>

                      {/* Source & Confidence */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center space-x-1 text-[11px] text-slate-300">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="truncate max-w-[110px]" title={job.primarySourceName}>
                            {job.primarySourceName.replace('Careers Portal', '').replace('Gateway', '')}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => onSaveJob(job.id)}
                            className={`p-1.5 rounded border transition-colors ${
                              isSaved 
                                ? 'bg-blue-600 text-white border-blue-500' 
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700'
                            }`}
                            title={isSaved ? 'Saved in Tracker' : 'Save Job'}
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (onDirectApply) {
                                onDirectApply(job);
                              } else {
                                onSelectJob(job);
                              }
                            }}
                            className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center space-x-1 transition-colors shadow-2xs"
                            title="Apply directly using your saved resume"
                          >
                            <Sparkles className="w-3 h-3 text-amber-300" />
                            <span>Apply</span>
                          </button>

                          <a
                            href={job.jobUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-colors"
                            title="Open verified employer career portal"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CARD VIEW */}
      {viewMode === 'card' && jobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => {
            const badge = getFreshnessBadge(job.firstDetectedAt);
            const isSaved = savedJobIds.has(job.id);

            return (
              <div
                key={job.id}
                id={`job-grid-card-${job.id}`}
                onClick={() => onSelectJob(job)}
                className="bg-slate-900 border border-slate-800/90 hover:border-indigo-500/50 rounded-xl p-5 cursor-pointer transition-all hover:shadow-xl space-y-3 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${badge.classes}`}>
                        {badge.label}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center space-x-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>{job.primarySourceName}</span>
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {job.title}
                    </h3>
                  </div>

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
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
                  <div className="flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-semibold text-slate-100">{job.companyName}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{job.location}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Exp: </span>
                    <span className="font-medium text-slate-200">{job.experience}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Salary: </span>
                    <span className="font-bold text-emerald-400">{job.salary}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.skills.map((skill, idx) => (
                    <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-400">
                    Grad: {job.eligibility.graduationYears.join(', ')}
                  </span>
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => {
                        if (onDirectApply) {
                          onDirectApply(job);
                        } else {
                          onSelectJob(job);
                        }
                      }}
                      className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1 transition-colors"
                    >
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>Apply with Resume</span>
                    </button>
                    <a
                      href={job.jobUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-colors"
                      title="Open career portal"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
