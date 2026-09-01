import React, { useState, useEffect } from 'react';
import { 
  X, CheckCircle, Send, FileText, Sparkles, Building2, MapPin, 
  IndianRupee, Briefcase, User, Mail, Phone, GraduationCap, 
  ExternalLink, ArrowRight, ShieldCheck, Edit3, AlertCircle, Shield, CheckCheck
} from 'lucide-react';
import { Job, UserProfile } from '../types';
import { api } from '../lib/api';
import { getUserProfile, saveUserProfile, isProfileConfigured } from '../lib/userProfile';
import { gmailService } from '../lib/gmailService';
import { GoogleIdentityServicesAuth } from '../lib/gisAuth';

interface DirectApplyModalProps {
  job: Job | null;
  onClose: () => void;
  onAppliedSuccess?: (jobId: string, applicationId: string) => void;
  onApplicationSuccess?: (jobId: string, applicationId: string) => void;
  onOpenProfile?: () => void;
  onEditProfile?: () => void;
  onOpenPortal?: (url: string) => void;
}

export const DirectApplyModal: React.FC<DirectApplyModalProps> = ({
  job,
  onClose,
  onAppliedSuccess,
  onApplicationSuccess,
  onOpenProfile,
  onEditProfile,
  onOpenPortal
}) => {
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [coverNote, setCoverNote] = useState('');
  const [instantApply, setInstantApply] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  const [appliedTime, setAppliedTime] = useState('');
  const [matchScore, setMatchScore] = useState(0);
  const [matchedSkillsCount, setMatchedSkillsCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [gmailSentStatus, setGmailSentStatus] = useState<'idle' | 'sending' | 'sent' | 'not_connected' | 'failed'>('idle');

  useEffect(() => {
    if (!job) return;
    const currentProfile = getUserProfile();
    setProfile(currentProfile);
    setInstantApply(currentProfile.instantOneClickApply || false);
    
    if (currentProfile.coverNote) {
      setCoverNote(currentProfile.coverNote);
    } else if (currentProfile.fullName) {
      setCoverNote(`I am an aspiring software engineer specializing in ${job.skills.slice(0, 3).join(', ')} with an aggregate CGPA of ${currentProfile.cgpa || '8.0'}. I am enthusiastic about contributing to ${job.companyName} and available for immediate joining.`);
    } else {
      setCoverNote(`I am interested in applying for the ${job.title} position at ${job.companyName} and available for immediate joining.`);
    }
    
    // Accurate ATS skill match calculation
    const candSkills = (currentProfile.skills || []).map(s => s.trim().toLowerCase()).filter(Boolean);
    const jobSkills = job.skills || [];
    
    if (candSkills.length === 0 || jobSkills.length === 0) {
      setMatchScore(0);
      setMatchedSkillsCount(0);
    } else {
      let matched = 0;
      jobSkills.forEach(js => {
        const jsl = js.toLowerCase();
        if (candSkills.some(cs => jsl.includes(cs) || cs.includes(jsl))) {
          matched++;
        }
      });
      const calculated = Math.round((matched / jobSkills.length) * 100);
      setMatchScore(calculated);
      setMatchedSkillsCount(matched);
    }
  }, [job]);

  if (!job) return null;

  const isConfigured = isProfileConfigured(profile);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfigured) {
      if (onOpenProfile) onOpenProfile();
      else if (onEditProfile) onEditProfile();
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Save instant apply preference if changed
      if (instantApply !== profile.instantOneClickApply) {
        const updated = { ...profile, instantOneClickApply: instantApply, coverNote };
        saveUserProfile(updated);
        setProfile(updated);
      }

      const res = await api.applyToJob({
        jobId: job.id,
        candidateName: profile.fullName,
        candidateEmail: profile.email,
        candidatePhone: profile.phone,
        candidateDegree: `${profile.degree || 'Degree'} (${profile.branch || 'Engineering'})`,
        graduationYear: profile.graduationYear || 2026,
        candidateSkills: profile.skills,
        resumeFileName: profile.resumeFileName || 'Resume.pdf',
        coverNote
      });

      setApplicationId(res.applicationId);
      setAppliedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setIsSuccess(true);
      if (onAppliedSuccess) {
        onAppliedSuccess(job.id, res.applicationId);
      }
      if (onApplicationSuccess) {
        onApplicationSuccess(job.id, res.applicationId);
      }

      // Try sending confirmation notification to Gmail if authorized
      if (GoogleIdentityServicesAuth.isAuthorized()) {
        setGmailSentStatus('sending');
        gmailService.sendApplicationConfirmation({
          to: profile.email,
          candidateName: profile.fullName,
          candidateEmail: profile.email,
          companyName: job.companyName,
          roleTitle: job.title,
          applicationId: res.applicationId,
          appliedAt: new Date().toISOString(),
          matchScore,
          resumeFileName: profile.resumeFileName,
          portalUrl: job.jobUrl
        }).then(() => {
          setGmailSentStatus('sent');
        }).catch((e) => {
          console.warn('Could not auto-send Gmail notification', e);
          setGmailSentStatus('failed');
        });
      } else {
        setGmailSentStatus('not_connected');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 relative">
          <button
            id="close-direct-apply-modal"
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              1-Click Resume Application
            </span>
            <span className="text-xs text-blue-200">
              Direct Recruiter Submission
            </span>
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight">
            {job.title}
          </h2>
          
          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-200 mt-2">
            <span className="flex items-center gap-1 font-medium">
              <Building2 className="w-3.5 h-3.5 text-blue-300" />
              {job.companyName}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-300" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-300" />
              {job.salary}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-amber-300" />
              {job.experience}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">
                Application Successfully Submitted!
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Your resume and candidate profile have been recorded and sent to the talent acquisition desk at <span className="font-semibold text-slate-800">{job.companyName}</span>.
              </p>
            </div>

            {/* Application Receipt Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left max-w-md mx-auto space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Application Ref ID</span>
                <span className="font-mono font-bold text-blue-700">{applicationId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Attached Resume</span>
                <span className="font-medium text-slate-900 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  {profile.resumeFileName}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Calculated ATS Match</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {matchScore}% Match ({matchedSkillsCount}/{job.skills.length} Skills)
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Submitted Timestamp</span>
                <span className="font-medium text-slate-800">Today at {appliedTime}</span>
              </div>
              <div className="flex justify-between items-center pt-0.5">
                <span className="text-slate-500 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-red-500" />
                  Gmail Dispatch Receipt
                </span>
                {gmailSentStatus === 'sent' ? (
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <CheckCheck className="w-3 h-3 text-emerald-600" />
                    Sent to {profile.email}
                  </span>
                ) : gmailSentStatus === 'sending' ? (
                  <span className="text-blue-600 font-medium animate-pulse text-[11px]">
                    Sending alert to Gmail...
                  </span>
                ) : gmailSentStatus === 'not_connected' ? (
                  <span className="text-slate-500 text-[11px]">
                    Gmail not linked (Logged in Pipeline)
                  </span>
                ) : (
                  <span className="text-amber-600 text-[11px]">
                    Receipt logged in JobPulse Tracker
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                id="btn-close-apply-success"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-xs cursor-pointer"
              >
                Done & Track in Pipeline
              </button>
              <button
                id="btn-open-portal-after-apply"
                onClick={() => {
                  if (onOpenPortal) onOpenPortal(job.jobUrl);
                  else window.open(job.jobUrl, '_blank', 'noopener,noreferrer');
                }}
                className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Visit Career Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : !isConfigured ? (
          /* Profile Not Set Up Yet Prompt */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-blue-50/50">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">
                Candidate Profile & Resume Required
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                Each candidate manages their own private profile. Please fill in your name, contact details, and upload your resume to apply in 1-click.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left max-w-md mx-auto space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2 text-slate-800">
                <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Private Local Storage:</strong> Your information is stored solely inside your personal browser.</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span><strong>Automated ATS Match:</strong> Adding your skills calculates exact fit score for every job.</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                type="button"
                id="btn-setup-profile-now"
                onClick={() => {
                  if (onOpenProfile) onOpenProfile();
                }}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Set Up My Resume & Profile Now</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onOpenPortal) onOpenPortal(job.jobUrl);
                  else window.open(job.jobUrl, '_blank', 'noopener,noreferrer');
                }}
                className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Apply on Official Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 text-slate-900">
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <span className="font-semibold">Error:</span> {error}
              </div>
            )}

            {/* Attached Resume Box */}
            <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {profile.resumeFileName || 'Resume Document Attached'}
                    </span>
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-semibold rounded">
                      {profile.resumeFileSize || 'PDF'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Candidate: {profile.fullName} • {profile.degree || 'Engineering'} ({profile.graduationYear})
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="btn-edit-resume-profile"
                onClick={() => {
                  if (onOpenProfile) onOpenProfile();
                }}
                className="px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Change / Edit</span>
              </button>
            </div>

            {/* Candidate Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <div className="flex items-center gap-2 text-slate-800">
                <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate"><span className="text-slate-500 font-normal">Name:</span> <strong className="font-semibold">{profile.fullName}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-800">
                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate"><span className="text-slate-500 font-normal">Email:</span> <strong className="font-semibold">{profile.email}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-800">
                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate"><span className="text-slate-500 font-normal">Phone:</span> <strong className="font-semibold">{profile.phone}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-800">
                <GraduationCap className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate"><span className="text-slate-500 font-normal">CGPA:</span> <strong className="font-semibold">{profile.cgpa || 'Not specified'} ({profile.graduationYear})</strong></span>
              </div>
            </div>

            {/* Skills Match Overview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Automated ATS Skills Match
                </span>
                <span className={`font-bold px-2 py-0.5 rounded border text-xs ${
                  matchScore >= 70 
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                    : matchScore >= 40 
                    ? 'text-amber-700 bg-amber-50 border-amber-200'
                    : 'text-slate-700 bg-slate-100 border-slate-200'
                }`}>
                  {matchScore}% Match ({matchedSkillsCount}/{job.skills.length} Required Skills)
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((skill, idx) => {
                  const candSkills = (profile.skills || []).map(s => s.toLowerCase());
                  const hasSkill = candSkills.some(s => s.includes(skill.toLowerCase()) || skill.toLowerCase().includes(s));
                  return (
                    <span
                      key={idx}
                      className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${
                        hasSkill
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {hasSkill && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                      {skill}
                    </span>
                  );
                })}
              </div>
              {profile.skills.length === 0 && (
                <p className="text-[11px] text-slate-500 italic">
                  Tip: Add your tech skills in your profile to compute automatic ATS match scores across all job openings.
                </p>
              )}
            </div>

            {/* Cover Note */}
            <div className="space-y-1.5">
              <label htmlFor="coverNote" className="block text-xs font-semibold text-slate-800">
                Candidate Note / Recruiter Pitch
              </label>
              <textarea
                id="coverNote"
                rows={2}
                value={coverNote}
                onChange={e => setCoverNote(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400 font-medium"
                placeholder="Add a quick note or pitch for the hiring team..."
              />
            </div>

            {/* Instant apply toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-slate-800">
                  Enable 1-Click Instant Apply
                </p>
                <p className="text-[11px] text-slate-500">
                  Directly submit future jobs using this saved resume with a single click.
                </p>
              </div>
              <input
                type="checkbox"
                id="instant-apply-toggle"
                checked={instantApply}
                onChange={e => setInstantApply(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                id="btn-confirm-apply-resume"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Application with My Resume</span>
                  </>
                )}
              </button>

              <button
                type="button"
                id="btn-direct-apply-open-portal"
                onClick={() => {
                  if (onOpenPortal) onOpenPortal(job.jobUrl);
                  else window.open(job.jobUrl, '_blank', 'noopener,noreferrer');
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Open Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
