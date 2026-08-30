import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  MapPin, 
  Clock, 
  Building2, 
  ShieldCheck, 
  FileCheck, 
  ExternalLink, 
  Search, 
  AlertTriangle,
  Info,
  CheckCircle2,
  X,
  Share2,
  Check
} from 'lucide-react';
import { WalkInDrive, WalkInStatus } from '../types';

interface WalkInDrivesViewProps {
  walkIns: WalkInDrive[];
  totalCount: number;
  loading: boolean;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  onRefresh: () => void;
}

export const WalkInDrivesView: React.FC<WalkInDrivesViewProps> = ({
  walkIns,
  totalCount,
  loading,
  selectedStatus,
  setSelectedStatus,
  selectedCity,
  setSelectedCity,
  onRefresh
}) => {
  const [selectedWalkIn, setSelectedWalkIn] = useState<WalkInDrive | null>(null);
  const [copied, setCopied] = useState(false);

  const getStatusBadge = (status: WalkInStatus, dayOfWeek: string) => {
    switch (status) {
      case 'TODAY':
        return {
          label: '🔥 TODAY',
          classes: 'bg-rose-500 text-white font-bold animate-pulse shadow-md shadow-rose-500/20'
        };
      case 'TOMORROW':
        return {
          label: '⚡ TOMORROW',
          classes: 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
        };
      case 'UPCOMING':
        return {
          label: `🗓️ ${dayOfWeek.toUpperCase()}`,
          classes: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium'
        };
      case 'EXPIRED':
        return {
          label: 'EXPIRED',
          classes: 'bg-slate-800 text-slate-500 border border-slate-700'
        };
      default:
        return {
          label: 'ACTIVE',
          classes: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
        };
    }
  };

  const cities = ['All Cities', 'Pune', 'Bengaluru', 'Mumbai', 'Hyderabad', 'Chennai', 'Noida', 'Gurugram'];

  return (
    <div className="space-y-5 pb-12">
      {/* Walk-In Hero Header */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
              <Users className="w-3.5 h-3.5" />
              <span>DEDICATED WALK-IN INTERVIEW HUB</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Direct In-Person Walk-In Drives
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Attend on-the-spot interviews for entry-level and fresher software engineering roles across top tech hubs.
            </p>
          </div>

          {/* City Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {cities.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCity(c === 'All Cities' ? '' : c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  (c === 'All Cities' && !selectedCity) || selectedCity === c
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Tabs: All, Today, Tomorrow, Upcoming, Expired */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedStatus('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedStatus === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            All Drives ({totalCount})
          </button>
          <button
            onClick={() => setSelectedStatus('TODAY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedStatus === 'TODAY' ? 'bg-rose-600 text-white' : 'text-rose-400 hover:bg-slate-800'
            }`}
          >
            🔥 Today
          </button>
          <button
            onClick={() => setSelectedStatus('TOMORROW')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedStatus === 'TOMORROW' ? 'bg-amber-600 text-white' : 'text-amber-400 hover:bg-slate-800'
            }`}
          >
            ⚡ Tomorrow
          </button>
          <button
            onClick={() => setSelectedStatus('UPCOMING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedStatus === 'UPCOMING' ? 'bg-indigo-600 text-white' : 'text-indigo-400 hover:bg-slate-800'
            }`}
          >
            🗓️ Upcoming This Week
          </button>
          <button
            onClick={() => setSelectedStatus('EXPIRED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedStatus === 'EXPIRED' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:bg-slate-800'
            }`}
          >
            Past / Expired
          </button>
        </div>

        <div className="text-xs text-slate-400 flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>All venue addresses &amp; contacts verified</span>
        </div>
      </div>

      {/* Specialized Walk-In Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table id="walkins-table" className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Date &amp; Day</th>
                <th className="py-3 px-3">Company</th>
                <th className="py-3 px-3">Job Role</th>
                <th className="py-3 px-3">Experience</th>
                <th className="py-3 px-3">Location &amp; City</th>
                <th className="py-3 px-3">Interview Time</th>
                <th className="py-3 px-3">Salary</th>
                <th className="py-3 px-3">Eligibility</th>
                <th className="py-3 px-3">Venue / Address</th>
                <th className="py-3 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {walkIns.map((w) => {
                const statusBadge = getStatusBadge(w.status, w.dayOfWeek);

                return (
                  <tr
                    key={w.id}
                    id={`walkin-row-${w.id}`}
                    onClick={() => setSelectedWalkIn(w)}
                    className="hover:bg-slate-800/60 cursor-pointer transition-colors group"
                  >
                    {/* Status Badge */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] ${statusBadge.classes}`}>
                        {statusBadge.label}
                      </span>
                    </td>

                    {/* Date & Day */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-bold text-white flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{w.interviewDate}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">{w.dayOfWeek}</div>
                    </td>

                    {/* Company */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-bold text-white group-hover:text-amber-300 transition-colors flex items-center space-x-1">
                        <span>{w.companyName}</span>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-3 min-w-[180px]">
                      <div className="font-semibold text-slate-100">{w.role}</div>
                      <div className="text-[10px] text-slate-400">
                        {w.registrationRequired ? '⚠️ Registration Needed' : '✓ Direct On-Spot Entry'}
                      </div>
                    </td>

                    {/* Experience */}
                    <td className="py-3.5 px-3 whitespace-nowrap font-medium text-slate-300">
                      {w.experience}
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-slate-300">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{w.city}</span>
                      </div>
                    </td>

                    {/* Time */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center space-x-1 text-slate-300 font-medium">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>{w.startTime} – {w.endTime}</span>
                      </div>
                    </td>

                    {/* Salary */}
                    <td className="py-3.5 px-3 whitespace-nowrap font-semibold text-emerald-400">
                      {w.salary}
                    </td>

                    {/* Eligibility */}
                    <td className="py-3.5 px-3 max-w-[150px] truncate text-slate-400 text-[11px]" title={w.eligibility}>
                      {w.eligibility}
                    </td>

                    {/* Venue Preview */}
                    <td className="py-3.5 px-3 max-w-[200px] truncate text-slate-400 text-[11px]" title={w.venue}>
                      {w.venue}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWalkIn(w);
                        }}
                        className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-colors"
                      >
                        Venue &amp; Prep
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* WALK-IN DRIVE DETAIL MODAL */}
      {selectedWalkIn && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-3xl overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 relative">
              <button
                onClick={() => setSelectedWalkIn(null)}
                className="absolute top-5 right-5 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2 pr-10">
                <div className="flex items-center space-x-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                    WALK-IN INTERVIEW
                  </span>
                  <span className="text-xs text-slate-400">
                    Last Verified: {new Date(selectedWalkIn.lastVerifiedAt).toLocaleDateString()}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {selectedWalkIn.companyName} — {selectedWalkIn.role}
                </h2>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                  <span className="text-amber-300 font-bold flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{selectedWalkIn.interviewDate} ({selectedWalkIn.dayOfWeek})</span>
                  </span>
                  <span className="flex items-center space-x-1 text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedWalkIn.startTime} – {selectedWalkIn.endTime}</span>
                  </span>
                  <span className="font-bold text-emerald-400">
                    {selectedWalkIn.salary}
                  </span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 space-y-6 text-sm text-slate-200 overflow-y-auto max-h-[65vh]">
              {/* Venue Address Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>Interview Venue Address</span>
                </div>
                <p className="text-slate-100 font-medium text-sm leading-relaxed">
                  {selectedWalkIn.venue}
                </p>
                {selectedWalkIn.contactInfo && (
                  <div className="text-xs text-slate-400 pt-1">
                    Contact: <span className="text-slate-200">{selectedWalkIn.contactInfo}</span>
                  </div>
                )}
              </div>

              {/* Requirements & Eligibility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="font-bold text-slate-400 uppercase">Eligibility &amp; Batches</div>
                  <div className="text-slate-200 font-medium">{selectedWalkIn.eligibility}</div>
                  <div className="text-slate-400 pt-1">Exp: {selectedWalkIn.experience}</div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="font-bold text-slate-400 uppercase">Dress Code &amp; Conduct</div>
                  <div className="text-slate-200 font-medium">{selectedWalkIn.dressCode || 'Strictly Formal Attire'}</div>
                  <div className="text-slate-400 pt-1">
                    {selectedWalkIn.registrationRequired ? 'Online pre-registration mandatory' : 'Direct spot registration allowed'}
                  </div>
                </div>
              </div>

              {/* Mandatory Documents Checklist */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span>Mandatory Documents to Carry</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedWalkIn.requiredDocuments.map((doc, idx) => (
                    <div key={idx} className="flex items-center space-x-2 p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Tech Skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedWalkIn.skills.map((s, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedWalkIn.venue);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold flex items-center space-x-1.5 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? 'Venue Copied' : 'Copy Venue Address'}</span>
              </button>

              <a
                href={selectedWalkIn.sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
              >
                <span>View Official Circular / Notice</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
