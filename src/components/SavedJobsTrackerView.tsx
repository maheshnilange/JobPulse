import React, { useState } from 'react';
import { 
  Bookmark, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Building2, 
  MapPin, 
  Calendar, 
  Edit3,
  FileText
} from 'lucide-react';
import { ApplicationStatus, Job, SavedJobItem } from '../types';

interface SavedJobsTrackerViewProps {
  savedJobs: SavedJobItem[];
  onUpdateStatus: (id: string, status: string, notes?: string) => void;
  onRemove: (id: string) => void;
  onSelectJob: (job: Job) => void;
}

export const SavedJobsTrackerView: React.FC<SavedJobsTrackerViewProps> = ({
  savedJobs,
  onUpdateStatus,
  onRemove,
  onSelectJob
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  const statuses: ApplicationStatus[] = ['Saved', 'Applied', 'Assessment', 'Interview', 'Selected', 'Rejected'];

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'Saved': return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'Applied': return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'Assessment': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Interview': return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'Selected': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Rejected': return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
  };

  const filtered = selectedFilter === 'ALL' 
    ? savedJobs 
    : savedJobs.filter(s => s.status === selectedFilter);

  const startEditNotes = (item: SavedJobItem) => {
    setEditingId(item.id);
    setNotesText(item.notes || '');
  };

  const saveNotes = (id: string, currentStatus: string) => {
    onUpdateStatus(id, currentStatus, notesText);
    setEditingId(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold">
            <Bookmark className="w-3.5 h-3.5" />
            <span>PERSONAL APPLICATION TRACKER</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Saved Jobs &amp; Pipeline Status
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Keep track of your job applications, online assessments, interviews, and interview feedback.
          </p>
        </div>

        {/* Status Pipeline Counter Pills */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All ({savedJobs.length})
          </button>
          {statuses.map((st) => {
            const count = savedJobs.filter(s => s.status === st).length;
            return (
              <button
                key={st}
                onClick={() => setSelectedFilter(st)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  selectedFilter === st
                    ? 'bg-slate-700 text-white border-slate-500 font-bold'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center space-y-2">
          <Bookmark className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Jobs in this Stage</h3>
          <p className="text-xs text-slate-500">
            Click the bookmark icon on any job posting in the dashboard or table to save it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-md hover:border-slate-700 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 cursor-pointer" onClick={() => onSelectJob(item.job)}>
                  <div className="text-xs text-indigo-300 font-semibold">{item.job.companyName}</div>
                  <h3 className="text-base font-bold text-white hover:text-indigo-300 transition-colors">
                    {item.job.title}
                  </h3>
                  <div className="text-xs text-slate-400 flex items-center space-x-2">
                    <span>{item.job.location}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">{item.job.salary}</span>
                  </div>
                </div>

                <button
                  onClick={() => onRemove(item.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Remove from saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Status Selector */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                <label className="text-slate-400 font-semibold">Application Stage:</label>
                <div className="flex flex-wrap gap-1.5">
                  {statuses.map((st) => (
                    <button
                      key={st}
                      onClick={() => onUpdateStatus(item.id, st, item.notes)}
                      className={`px-2 py-1 rounded text-xs border font-medium transition-all ${
                        item.status === st
                          ? `${getStatusColor(st)} font-bold shadow-sm`
                          : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1 pt-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold flex items-center space-x-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Personal Notes &amp; Preparation:</span>
                  </span>
                  {editingId !== item.id && (
                    <button
                      onClick={() => startEditNotes(item)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{item.notes ? 'Edit' : 'Add Note'}</span>
                    </button>
                  )}
                </div>

                {editingId === item.id ? (
                  <div className="space-y-2 pt-1">
                    <textarea
                      value={notesText}
                      onChange={(e) => setNotesText(e.target.value)}
                      placeholder="e.g. Assessment scheduled for Saturday, 10 AM on HackerRank..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                      rows={2}
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveNotes(item.id, item.status)}
                        className="px-3 py-1 rounded bg-indigo-600 text-white text-xs font-bold"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-[11px]">
                    {item.notes || <span className="text-slate-500 italic">No notes added yet.</span>}
                  </p>
                )}
              </div>

              {/* Bottom Apply on Source */}
              <div className="pt-2 flex justify-end">
                <a
                  href={item.job.jobUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center space-x-1 transition-colors"
                >
                  <span>Apply on Official Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
