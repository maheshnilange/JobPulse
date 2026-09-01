import React, { useState, useEffect } from 'react';
import { 
  X, User, Mail, Phone, MapPin, GraduationCap, FileText, 
  Upload, Trash2, Plus, Check, Sparkles, Shield,
  Github, Linkedin, Globe, Zap, AlertCircle
} from 'lucide-react';
import { UserProfile } from '../types';
import { defaultUserProfile, sampleFresherTemplate, getUserProfile, saveUserProfile, clearUserProfile } from '../lib/userProfile';

interface ResumeProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (profile: UserProfile) => void;
}

export const ResumeProfileModal: React.FC<ResumeProfileModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated
}) => {
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [newSkill, setNewSkill] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setProfile(getUserProfile());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveUserProfile(profile);
    setSavedSuccess(true);
    if (onProfileUpdated) onProfileUpdated(profile);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeFormatted = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = () => {
      setProfile(prev => ({
        ...prev,
        resumeFileName: file.name,
        resumeFileSize: sizeFormatted,
        resumeUploadedAt: new Date().toISOString().split('T')[0],
        resumeDataUrl: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeResumeFile = () => {
    setProfile(prev => ({
      ...prev,
      resumeFileName: '',
      resumeFileSize: '',
      resumeUploadedAt: '',
      resumeDataUrl: ''
    }));
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    if (!profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
    }
    setNewSkill('');
  };

  const removeSkill = (skillToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  const handleLoadSample = () => {
    setProfile(sampleFresherTemplate);
  };

  const handleClearAll = () => {
    clearUserProfile();
    setProfile(defaultUserProfile);
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
            id="close-resume-profile-modal"
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <FileText className="w-3.5 h-3.5" />
              Candidate Resume & 1-Click Profile
            </span>
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight">
            My Application Profile & Resume
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Configure your personal details, skill tags, and resume document. Each user fills their own details locally.
          </p>
        </div>

        {/* Privacy Note Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center gap-2 text-xs text-amber-900">
          <Shield className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Client-Side Private Storage:</strong> Your uploaded resume and profile are stored safely inside your own browser. No other users can see or access your information.
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[72vh] overflow-y-auto text-slate-900">
          {savedSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              Profile and resume settings successfully saved to your browser!
            </div>
          )}

          {/* Section 1: Attached Resume File */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                Active Resume Document
              </span>
              <label 
                htmlFor="resume-upload-input"
                className="cursor-pointer px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{profile.resumeFileName ? 'Replace Resume' : 'Upload PDF / DOCX'}</span>
                <input 
                  id="resume-upload-input"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {profile.resumeFileName ? (
              <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    PDF
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {profile.resumeFileName}
                    </p>
                    <p className="text-[11px] text-slate-600">
                      {profile.resumeFileSize || 'Ready'} • Uploaded on {profile.resumeUploadedAt || 'Today'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded border border-emerald-200">
                    Ready to Apply
                  </span>
                  <button
                    type="button"
                    onClick={removeResumeFile}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors rounded"
                    title="Remove attached resume"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-white border border-dashed border-slate-300 rounded-lg text-center space-y-1">
                <p className="text-xs font-semibold text-slate-700">No Resume Attached Yet</p>
                <p className="text-[11px] text-slate-500">Click &ldquo;Upload PDF / DOCX&rdquo; above to attach your resume file for 1-click job applications.</p>
              </div>
            )}
          </div>

          {/* Section 2: Personal & Contact Information */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Personal & Contact Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-800 font-semibold mb-1">Full Name *</label>
                <input 
                  type="text"
                  value={profile.fullName}
                  onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-xs text-xs sm:text-sm"
                  placeholder="e.g. Rahul Sharma"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-800 font-semibold mb-1">Email Address *</label>
                <input 
                  type="email"
                  value={profile.email}
                  onChange={e => setProfile({ ...profile, email: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-xs text-xs sm:text-sm"
                  placeholder="e.g. rahul.sharma@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-800 font-semibold mb-1">Phone Number *</label>
                <input 
                  type="tel"
                  value={profile.phone}
                  onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-xs text-xs sm:text-sm"
                  placeholder="+91 98765 43210"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-800 font-semibold mb-1">Current Location</label>
                <input 
                  type="text"
                  value={profile.location}
                  onChange={e => setProfile({ ...profile, location: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-xs text-xs sm:text-sm"
                  placeholder="e.g. Pune / Bengaluru / Remote"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Academic & Batch Information */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Academic Background & Fresher Eligibility
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-800 font-semibold mb-1">Degree & Branch</label>
                <input 
                  type="text"
                  value={profile.degree}
                  onChange={e => setProfile({ ...profile, degree: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-xs text-xs sm:text-sm"
                  placeholder="e.g. B.E. Computer Engineering"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-semibold mb-1">Graduation Batch Year</label>
                <select 
                  value={profile.graduationYear}
                  onChange={e => setProfile({ ...profile, graduationYear: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-xs text-xs sm:text-sm"
                >
                  <option value={2026}>2026 Batch</option>
                  <option value={2025}>2025 Batch</option>
                  <option value={2024}>2024 Batch</option>
                  <option value={2027}>2027 Batch</option>
                  <option value={2023}>2023 Batch</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-800 font-semibold mb-1">Aggregate CGPA / %</label>
                <input 
                  type="text"
                  value={profile.cgpa}
                  onChange={e => setProfile({ ...profile, cgpa: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-xs text-xs sm:text-sm"
                  placeholder="e.g. 8.2 / 10 or 78%"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Skills & Tech Stack */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                My Skills (For Automated ATS Match Calculation)
              </h3>
              <span className="text-[11px] text-slate-500">
                {profile.skills.length} skills added
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl min-h-[52px]">
              {profile.skills.length > 0 ? (
                profile.skills.map((skill, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 shadow-2xs"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-0.5 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic py-1">No skills added yet. Add your programming languages & frameworks below to calculate ATS match on jobs.</p>
              )}
            </div>

            <div className="flex gap-2">
              <input 
                type="text"
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                placeholder="Add skill (e.g. Java, Python, React, Spring Boot, SQL, AWS)..."
                className="flex-1 p-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-xs"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Section 5: Online Links */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Profiles & Portfolio Links (Optional)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-800 font-semibold mb-1 flex items-center gap-1">
                  <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                  LinkedIn URL
                </label>
                <input 
                  type="url"
                  value={profile.linkedinUrl || ''}
                  onChange={e => setProfile({ ...profile, linkedinUrl: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-xs text-xs"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div>
                <label className="block text-slate-800 font-semibold mb-1 flex items-center gap-1">
                  <Github className="w-3.5 h-3.5 text-slate-900" />
                  GitHub Profile
                </label>
                <input 
                  type="url"
                  value={profile.githubUrl || ''}
                  onChange={e => setProfile({ ...profile, githubUrl: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-xs text-xs"
                  placeholder="https://github.com/..."
                />
              </div>

              <div>
                <label className="block text-slate-800 font-semibold mb-1 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-emerald-600" />
                  Portfolio / Website
                </label>
                <input 
                  type="url"
                  value={profile.portfolioUrl || ''}
                  onChange={e => setProfile({ ...profile, portfolioUrl: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-xs text-xs"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Section 6: Instant 1-Click Apply Toggle */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
            <div className="space-y-0.5 pr-4">
              <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                Enable 1-Click Instant Apply Mode
              </p>
              <p className="text-[11px] text-slate-600">
                When enabled, clicking &ldquo;Apply&rdquo; submits your saved profile directly with your attached resume.
              </p>
            </div>
            <input 
              type="checkbox"
              id="instant-apply-profile-checkbox"
              checked={profile.instantOneClickApply}
              onChange={e => setProfile({ ...profile, instantOneClickApply: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer"
              >
                Load Sample Template
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold underline cursor-pointer"
              >
                Clear My Data
              </button>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="btn-save-resume-profile"
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save Profile Settings</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
