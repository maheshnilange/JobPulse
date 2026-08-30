import React, { useState } from 'react';
import { 
  Settings2, 
  RotateCw, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Server, 
  Radio, 
  Layers, 
  Play,
  ToggleLeft,
  ToggleRight,
  Database
} from 'lucide-react';
import { JobSourceConfig, Job } from '../types';

interface AdminDashboardViewProps {
  sources: JobSourceConfig[];
  jobs: Job[];
  onToggleSource: (id: string) => void;
  onTriggerCrawl: (sourceId?: string) => Promise<any>;
  onVerifyJobStatus: (id: string, status: string, confidence?: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  sources,
  jobs,
  onToggleSource,
  onTriggerCrawl,
  onVerifyJobStatus
}) => {
  const [crawlingId, setCrawlingId] = useState<string | null>(null);
  const [crawlSummary, setCrawlSummary] = useState<any[] | null>(null);
  const [selectedTab, setSelectedTab] = useState<'sources' | 'moderation' | 'telemetry'>('sources');

  const handleCrawl = async (sourceId?: string) => {
    setCrawlingId(sourceId || 'all');
    try {
      const res = await onTriggerCrawl(sourceId);
      setCrawlSummary(res);
    } catch (e) {
      console.error(e);
    } finally {
      setCrawlingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold">
            <Server className="w-3.5 h-3.5" />
            <span>OPERATIONAL CONTROL &amp; SOURCE HEALTH</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            JobPulse Admin Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Monitor real-time feed adapters, deduplication telemetry, and moderate job authenticity.
          </p>
        </div>

        <button
          onClick={() => handleCrawl()}
          disabled={crawlingId !== null}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
        >
          <RotateCw className={`w-4 h-4 ${crawlingId === 'all' ? 'animate-spin' : ''}`} />
          <span>{crawlingId === 'all' ? 'Executing Crawl Pipeline...' : 'Trigger Full Ingestion Crawl'}</span>
        </button>
      </div>

      {/* Admin Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setSelectedTab('sources')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            selectedTab === 'sources' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          Active Source Adapters ({sources.length})
        </button>
        <button
          onClick={() => setSelectedTab('moderation')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            selectedTab === 'moderation' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          Job Moderation &amp; Verification ({jobs.length})
        </button>
        <button
          onClick={() => setSelectedTab('telemetry')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            selectedTab === 'telemetry' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          Deduplication &amp; Logs
        </button>
      </div>

      {/* TAB 1: SOURCE ADAPTERS */}
      {selectedTab === 'sources' && (
        <div className="space-y-4">
          {/* Crawl Summary Box */}
          {crawlSummary && (
            <div className="bg-slate-950 border border-emerald-500/40 rounded-xl p-4 space-y-2">
              <div className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Last Crawl Pipeline Execution Results</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {crawlSummary.map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="font-bold text-white">{item.sourceName}</div>
                    <div className="text-slate-400 text-[11px] mt-1">
                      New Jobs: <span className="text-emerald-400 font-bold">{item.newJobsDiscovered}</span> | Merged: {item.duplicatesMerged}
                    </div>
                    <div className="text-[10px] text-slate-500">{item.durationMs}ms</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sources Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Source Name</th>
                    <th className="py-3 px-3">Adapter Type</th>
                    <th className="py-3 px-3">Interval</th>
                    <th className="py-3 px-3">Last Crawl</th>
                    <th className="py-3 px-3">Success / Error</th>
                    <th className="py-3 px-3">Total Ingested</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-200">
                  {sources.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                          s.status === 'HEALTHY'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}>
                          {s.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 font-bold text-white">
                        {s.name}
                      </td>

                      <td className="py-3.5 px-3 text-slate-300 font-mono text-[11px]">
                        {s.sourceType}
                      </td>

                      <td className="py-3.5 px-3 text-slate-300">
                        {s.pollingIntervalMinutes} min
                      </td>

                      <td className="py-3.5 px-3 text-slate-400">
                        {s.lastCheckedAt ? new Date(s.lastCheckedAt).toLocaleTimeString() : 'Just now'}
                      </td>

                      <td className="py-3.5 px-3 font-mono">
                        <span className="text-emerald-400">{s.successCount}</span> / <span className="text-rose-400">{s.errorCount}</span>
                      </td>

                      <td className="py-3.5 px-3 font-bold text-indigo-300">
                        {s.totalJobsDetected}
                      </td>

                      <td className="py-3.5 px-3 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleCrawl(s.id)}
                          disabled={crawlingId !== null}
                          className="px-2.5 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-[11px] font-semibold transition-colors"
                        >
                          {crawlingId === s.id ? 'Running...' : 'Run Crawl'}
                        </button>

                        <button
                          onClick={() => onToggleSource(s.id)}
                          className="text-slate-400 hover:text-white"
                          title={s.active ? 'Disable Source' : 'Enable Source'}
                        >
                          {s.active ? (
                            <ToggleRight className="w-5 h-5 text-emerald-400 inline" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-slate-600 inline" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MODERATION */}
      {selectedTab === 'moderation' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Company</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Source &amp; Confidence</th>
                    <th className="py-3 px-3">Detected At</th>
                    <th className="py-3 px-3 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-200">
                  {jobs.slice(0, 15).map((job) => (
                    <tr key={job.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          job.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-white">{job.companyName}</td>
                      <td className="py-3.5 px-3 text-slate-200">{job.title}</td>
                      <td className="py-3.5 px-3 text-slate-300">{job.sourceConfidence}</td>
                      <td className="py-3.5 px-3 text-slate-400">{new Date(job.firstDetectedAt).toLocaleTimeString()}</td>
                      <td className="py-3.5 px-3 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => onVerifyJobStatus(job.id, 'ACTIVE', 'OFFICIAL_CAREER_PAGE')}
                          className="px-2 py-1 rounded bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold"
                        >
                          Verify URL
                        </button>
                        <button
                          onClick={() => onVerifyJobStatus(job.id, 'EXPIRED')}
                          className="px-2 py-1 rounded bg-rose-600/20 text-rose-300 border border-rose-500/30 text-[10px] font-semibold"
                        >
                          Expire
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TELEMETRY & LOGS */}
      {selectedTab === 'telemetry' && (
        <div className="space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 font-mono text-xs text-slate-300 space-y-2 max-h-96 overflow-y-auto">
            <div className="text-emerald-400 font-bold">[TELEMETRY BOOT] JobPulse Monitoring Cluster v1.0.0 started.</div>
            <div className="text-slate-400">[ADAPTER-INIT] 10 sources registered with exponential backoff &amp; rate limit guards.</div>
            <div className="text-indigo-300">[DEDUP-ENGINE] Fuzzy matcher initialized. Suffix normalization: active.</div>
            <div className="text-slate-400">[CRAWL-DISPATCH] Polled TCS iBegin portal: 1 new job detected (0 duplicates).</div>
            <div className="text-slate-400">[CRAWL-DISPATCH] Polled Infosys career engine: 1 new job detected.</div>
            <div className="text-amber-400">[ALERT-ENGINE] Matched 3 active alerts. Triggered In-App &amp; Web Push notifications.</div>
            <div className="text-slate-500">[WALK-IN-SYNC] WalkInService updated date statuses: 2 TODAY, 1 TOMORROW, 2 UPCOMING.</div>
          </div>
        </div>
      )}
    </div>
  );
};
