import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  MapPin, 
  ShieldCheck, 
  Bookmark, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Award, 
  GraduationCap, 
  Layers, 
  Share2,
  Check,
  BrainCircuit,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { Job } from '../types';
import { api } from '../lib/api';

interface JobDetailModalProps {
  job: Job | null;
  onClose: () => void;
  onSaveJob: (jobId: string) => void;
  isSaved: boolean;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  onClose,
  onSaveJob,
  isSaved
}) => {
  const [copied, setCopied] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{ summary: string; keyHighlights: string[]; interviewTips: string[] } | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'eligibility' | 'timeline' | 'ai_prep'>('overview');

  useEffect(() => {
    if (job) {
      // Auto trigger AI prep summary
      setLoadingAi(true);
      api.analyzeJobWithAI(job.description)
        .then(res => setAiAnalysis(res))
        .catch(err => console.warn('AI analysis err:', err))
        .finally(() => setLoadingAi(false));
    }
  }, [job?.id]);

  if (!job) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="job-detail-modal-overlay" className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        id="job-detail-modal-content"
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 relative">
          <button
            id="job-detail-close-btn"
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-2 pr-10">
            {/* Top Tag Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold flex items-center space-x-1">
                <span>🔥 DETECTED:</span>
                <span>{new Date(job.firstDetectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </span>

              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{job.primarySourceName}</span>
              </span>

              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                ID: {job.externalJobId}
              </span>
            </div>

            {/* Title & Company */}
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {job.title}
            </h2>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-sm text-slate-300">
              <div className="flex items-center space-x-1.5 font-semibold text-indigo-300">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span>{job.companyName}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="flex items-center space-x-1 text-slate-400">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span>{job.location}</span>
              </div>
              <div className="font-bold text-emerald-400">
                {job.salary}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-2 pt-4 border-t border-slate-800/80 mt-4 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Overview &amp; Description
            </button>
            <button
              onClick={() => setActiveTab('eligibility')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'eligibility' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Eligibility Criteria
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'timeline' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Ingestion Timeline ({job.timeline.length})
            </button>
            <button
              onClick={() => setActiveTab('ai_prep')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                activeTab === 'ai_prep' ? 'bg-purple-600 text-white shadow-sm' : 'text-purple-300 hover:bg-purple-950/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Prep &amp; Tips</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 text-sm text-slate-200">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <div>
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Experience</div>
                  <div className="text-sm font-bold text-white mt-0.5">{job.experience}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Work Mode</div>
                  <div className="text-sm font-bold text-white mt-0.5">{job.workMode}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Job Type</div>
                  <div className="text-sm font-bold text-white mt-0.5">{job.employmentType}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Graduation Batches</div>
                  <div className="text-sm font-bold text-indigo-300 mt-0.5">
                    {job.eligibility.graduationYears.join(', ')}
                  </div>
                </div>
              </div>

              {/* Skills Chips */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Required Skills &amp; Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Role Description</h3>
                <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-line bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
                  {job.description}
                </p>
              </div>

              {/* Responsibilities */}
              {job.responsibilities && job.responsibilities.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Key Responsibilities</h3>
                  <ul className="space-y-2">
                    {job.responsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-slate-300 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ELIGIBILITY CRITERIA */}
          {activeTab === 'eligibility' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5 text-indigo-400" />
                  <span>Structured Qualification &amp; Eligibility Criteria</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                    <div className="text-xs text-slate-400 font-semibold">Eligible Degree(s)</div>
                    <div className="text-white font-medium">{job.eligibility.degree.join(', ')}</div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                    <div className="text-xs text-slate-400 font-semibold">Eligible Branches / Streams</div>
                    <div className="text-white font-medium">{job.eligibility.branches.join(', ')}</div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                    <div className="text-xs text-slate-400 font-semibold">Graduation Year / Batch</div>
                    <div className="text-indigo-300 font-bold">{job.eligibility.graduationYears.join(', ')} Batches</div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                    <div className="text-xs text-slate-400 font-semibold">Academic Criteria / CGPA Cutoff</div>
                    <div className="text-emerald-400 font-bold">{job.eligibility.cgpaRequirement}</div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                    <div className="text-xs text-slate-400 font-semibold">Backlog Policy</div>
                    <div className="text-amber-300 font-medium">{job.eligibility.backlogRequirement}</div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                    <div className="text-xs text-slate-400 font-semibold">Experience Requirement</div>
                    <div className="text-white font-medium">{job.eligibility.experienceRequirement}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INGESTION TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-indigo-400" />
                  <span>JobPulse Real-Time Discovery &amp; Deduplication Audit Trail</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Every detected posting is normalized, checked for duplicates against 20+ sources, and validated.
                </p>

                <div className="space-y-3 pt-2">
                  {job.timeline.map((evt, idx) => (
                    <div key={idx} className="flex items-start space-x-3 text-xs">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <div className="flex-1 bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <div className="flex items-center justify-between font-semibold text-slate-200">
                          <span>{evt.stage.replace(/_/g, ' ')}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-400 mt-1">{evt.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI PREPARATION & TIPS */}
          {activeTab === 'ai_prep' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/30 rounded-xl p-5 space-y-4">
                <div className="flex items-center space-x-2 text-purple-300 font-bold text-base">
                  <BrainCircuit className="w-5 h-5 text-purple-400" />
                  <span>AI Fresher Career Assistant (Role Insights &amp; Prep)</span>
                </div>

                {loadingAi ? (
                  <div className="py-8 text-center space-y-2">
                    <Sparkles className="w-6 h-6 text-purple-400 animate-spin mx-auto" />
                    <p className="text-xs text-purple-300">Analyzing job requirements &amp; extracting fresher preparation tips...</p>
                  </div>
                ) : (
                  <div className="space-y-4 text-xs sm:text-sm">
                    {/* Summary */}
                    <div className="p-3 bg-purple-900/20 border border-purple-500/20 rounded-lg space-y-1">
                      <div className="font-bold text-purple-200 text-xs uppercase tracking-wider">Executive Summary</div>
                      <p className="text-slate-200">{aiAnalysis?.summary}</p>
                    </div>

                    {/* Highlights */}
                    <div className="space-y-2">
                      <div className="font-bold text-slate-300 text-xs uppercase tracking-wider">Key Highlights for Freshers</div>
                      <div className="space-y-1.5">
                        {aiAnalysis?.keyHighlights.map((hl, idx) => (
                          <div key={idx} className="flex items-start space-x-2 text-slate-300">
                            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                            <span>{hl}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Interview Tips */}
                    <div className="space-y-2 pt-2 border-t border-purple-500/20">
                      <div className="font-bold text-slate-300 text-xs uppercase tracking-wider">Recommended Technical Prep Tips</div>
                      <div className="space-y-2">
                        {aiAnalysis?.interviewTips.map((tip, idx) => (
                          <div key={idx} className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 flex items-start space-x-2 text-slate-300">
                            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center flex-shrink-0 font-bold">
                              {idx + 1}
                            </span>
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Sticky Footer */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onSaveJob(job.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center space-x-1.5 transition-colors ${
                isSaved
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>{isSaved ? 'Saved in Tracker' : 'Save Job'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>
          </div>

          <a
            id="job-detail-apply-original-btn"
            href={job.jobUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <span>Apply on Official Source</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
