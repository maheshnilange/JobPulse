import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Send, 
  ExternalLink, 
  LogOut, 
  Sparkles, 
  ShieldCheck, 
  Inbox, 
  Clock, 
  Building2,
  Calendar,
  MessageSquare,
  FileCheck2,
  ChevronRight,
  Shield
} from 'lucide-react';
import { gmailService, TrackedEmailStatus } from '../lib/gmailService';
import { GoogleIdentityServicesAuth } from '../lib/gisAuth';
import { SavedJobItem } from '../types';

interface GmailIntegrationViewProps {
  savedJobs: SavedJobItem[];
  onSelectJobId?: (jobId: string) => void;
}

export const GmailIntegrationView: React.FC<GmailIntegrationViewProps> = ({
  savedJobs,
  onSelectJobId
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [trackedEmails, setTrackedEmails] = useState<TrackedEmailStatus[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Check auth on mount
  useEffect(() => {
    const authorized = GoogleIdentityServicesAuth.isAuthorized();
    setIsConnected(authorized);
    if (authorized) {
      loadEmails();
    }
  }, []);

  const loadEmails = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const companies: string[] = Array.from(new Set(savedJobs.map(s => s.job?.companyName).filter((c): c is string => Boolean(c))));
      const emails = await gmailService.searchApplicationEmails(companies);
      setTrackedEmails(emails);
      const email = gmailService.getConnectedEmail();
      if (email) setUserEmail(email);
    } catch (err: any) {
      console.error('Error fetching emails', err);
      setError(err.message || 'Failed to fetch application updates from Gmail');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleConnectGmail = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      await gmailService.connect();
      setIsConnected(true);
      setSuccessNotice('Gmail connected successfully! Application notifications and updates are now active.');
      await loadEmails();
    } catch (err: any) {
      console.error('Failed to connect Gmail', err);
      setError(err.message || 'Could not connect Gmail. Please check popup permissions.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    gmailService.disconnect();
    setIsConnected(false);
    setUserEmail(null);
    setTrackedEmails([]);
    setSuccessNotice('Gmail disconnected.');
  };

  const getCategoryBadge = (cat: TrackedEmailStatus['category']) => {
    switch (cat) {
      case 'interview':
        return { label: 'Interview Invitation', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'assessment':
        return { label: 'Online Assessment / OA', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'confirmation':
        return { label: 'Application Receipt', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'update':
        return { label: 'Status Update', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      default:
        return { label: 'Recruiter Message', bg: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  const appliedJobs = savedJobs.filter(s => s.status === 'Applied' || s.applicationId);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold">
            <Mail className="w-3.5 h-3.5" />
            <span>GMAIL NOTIFICATIONS & STATUS TRACKER</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Gmail Application Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Receive automated email receipts when applying and monitor incoming test links, assessments, and interview invites directly in JobPulse.
          </p>
        </div>

        {isConnected ? (
          <div className="flex items-center gap-2">
            <button
              onClick={loadEmails}
              disabled={isRefreshing}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
              <span>{isRefreshing ? 'Checking...' : 'Check Status Updates'}</span>
            </button>
            <button
              onClick={handleDisconnect}
              className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Disconnect</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnectGmail}
            disabled={isConnecting}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs sm:text-sm font-bold flex items-center space-x-2 shadow-lg shadow-red-600/30 transition-all self-start sm:self-auto cursor-pointer disabled:opacity-50"
          >
            <Mail className="w-4 h-4" />
            <span>{isConnecting ? 'Connecting Google Account...' : 'Connect Gmail Account'}</span>
          </button>
        )}
      </div>

      {/* Notices */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successNotice && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice(null)} className="text-emerald-400 hover:text-emerald-200 text-xs cursor-pointer font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Gmail Sync Status</div>
          <div className="flex items-center gap-2 pt-1">
            {isConnected ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-bold text-white">Active &amp; Connected</span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                <span className="text-sm font-bold text-slate-400">Not Connected</span>
              </>
            )}
          </div>
          <div className="text-[11px] text-slate-500 pt-1">
            {isConnected ? (userEmail || 'Connected for application notifications') : 'Click Connect Gmail above to enable email receipts'}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Applications Dispatched</div>
          <div className="text-xl font-bold text-white">{appliedJobs.length}</div>
          <div className="text-[11px] text-slate-500">
            {appliedJobs.length > 0 ? `${appliedJobs.length} active recruiter submissions` : 'Apply to any job to log submission'}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Tracked Inbound Messages</div>
          <div className="text-xl font-bold text-white">{trackedEmails.length}</div>
          <div className="text-[11px] text-slate-500">
            Interviews, OA test links &amp; confirmations
          </div>
        </div>
      </div>

      {/* Feature Walkthrough Card if not connected */}
      {!isConnected && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Why Connect Your Gmail?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-indigo-300 font-bold">
                <Send className="w-4 h-4" />
                <span>1. Instant Application Dispatch Receipts</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Whenever you submit an application through <strong>"Apply with Resume"</strong>, JobPulse automatically sends an official verification email with your <strong>Application ID</strong>, job details, and timestamp directly to your Gmail inbox.
              </p>
            </div>

            <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>2. Automated Status &amp; Interview Tracking</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                JobPulse scans for incoming recruiter emails (acknowledgements, HackerRank/Codility test invites, technical interview slots) so you never miss an urgent fresher assessment.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-center">
            <button
              onClick={handleConnectGmail}
              disabled={isConnecting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Mail className="w-4 h-4" />
              <span>Connect Gmail Now</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Tracked Messages List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Inbox className="w-4 h-4 text-slate-400" />
            <span>Gmail Application Pipeline &amp; Updates</span>
          </h2>
          {isConnected && (
            <span className="text-xs text-slate-400">
              Showing latest {trackedEmails.length} relevant emails
            </span>
          )}
        </div>

        {isConnected ? (
          trackedEmails.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center space-y-2">
              <Inbox className="w-8 h-8 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">No Application Emails Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No recent interview or assessment emails detected yet. When you apply or receive recruiter emails, click "Check Status Updates" above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {trackedEmails.map((email) => {
                const badge = getCategoryBadge(email.category);
                return (
                  <div
                    key={email.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-2.5 hover:border-slate-700 transition-all shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        {email.companyName && (
                          <span className="text-xs font-bold text-indigo-300 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                            {email.companyName}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {email.date}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white hover:text-indigo-300 transition-colors">
                        {email.subject}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        From: <span className="text-slate-300">{email.from}</span>
                      </p>
                    </div>

                    <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 leading-relaxed">
                      {email.snippet}
                    </p>
                  </div>
                );
              })}
            </div>
          )
        ) : null}
      </div>

      {/* Dispatched Applications History */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-indigo-400" />
            <span>Dispatched Applications &amp; Tracking IDs</span>
          </h2>
          <span className="text-xs text-slate-400">
            {appliedJobs.length} Applications Logged
          </span>
        </div>

        {appliedJobs.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-2">
            <FileCheck2 className="w-8 h-8 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Dispatched Applications Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click "Apply with Resume" on any job posting in the dashboard or listings to submit your profile and receive a tracking confirmation.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appliedJobs.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-indigo-400">{item.job?.companyName}</div>
                    <div className="text-sm font-bold text-white">{item.job?.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {item.job?.location} • <span className="text-emerald-400 font-semibold">{item.job?.salary}</span>
                    </div>
                  </div>
                  {item.applicationId && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-mono font-bold rounded">
                      {item.applicationId}
                    </span>
                  )}
                </div>

                <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 text-xs space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Submission Date:</span>
                    <span className="text-slate-300 font-medium">
                      {item.appliedAt ? new Date(item.appliedAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Attached Resume:</span>
                    <span className="text-slate-300 font-medium">{item.resumeFileName || 'Resume.pdf'}</span>
                  </div>
                  {item.matchScore !== undefined && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">ATS Fit:</span>
                      <span className="text-emerald-400 font-semibold">{item.matchScore}% Match</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  {onSelectJobId && (
                    <button
                      onClick={() => onSelectJobId(item.jobId)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>View Job</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                  <a
                    href={item.job?.jobUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-colors flex items-center gap-1"
                  >
                    <span>Career Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
