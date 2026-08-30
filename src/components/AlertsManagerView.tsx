import React, { useState } from 'react';
import { 
  BellRing, 
  Plus, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  Send, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Code2, 
  GraduationCap,
  Sparkles,
  Zap
} from 'lucide-react';
import { UserAlert } from '../types';

interface AlertsManagerViewProps {
  alerts: UserAlert[];
  onCreateAlert: (data: Partial<UserAlert>) => void;
  onToggleAlert: (id: string) => void;
  onDeleteAlert: (id: string) => void;
}

export const AlertsManagerView: React.FC<AlertsManagerViewProps> = ({
  alerts,
  onCreateAlert,
  onToggleAlert,
  onDeleteAlert
}) => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [keywords, setKeywords] = useState('Java, Spring Boot');
  const [locations, setLocations] = useState('Pune, Bengaluru');
  const [channels, setChannels] = useState<('in_app' | 'browser' | 'email' | 'telegram')[]>(['in_app', 'browser']);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateAlert({
      name,
      keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
      locations: locations.split(',').map(l => l.trim()).filter(Boolean),
      channels,
      experienceLevels: ['Fresher', '0–1 years'],
      jobCategories: ['Fresher', 'Java', 'Software'],
      active: true
    });

    setName('');
    setShowModal(false);
  };

  const toggleChannel = (ch: 'in_app' | 'browser' | 'email' | 'telegram') => {
    setChannels(prev => 
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
            <BellRing className="w-3.5 h-3.5" />
            <span>REAL-TIME JOB ALERT ENGINE</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Custom Job Alert Subscriptions
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Get pinged immediately via Web Push, Telegram, or In-App toasts when matching fresher roles are detected.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Alert</span>
        </button>
      </div>

      {/* Alert Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            id={`alert-card-${alert.id}`}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-all shadow-md relative"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-white">{alert.name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                    alert.active 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}>
                    {alert.active ? 'ACTIVE' : 'PAUSED'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Created {new Date(alert.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onToggleAlert(alert.id)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                  title={alert.active ? 'Pause Alert' : 'Resume Alert'}
                >
                  {alert.active ? (
                    <ToggleRight className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-slate-600" />
                  )}
                </button>
                <button
                  onClick={() => onDeleteAlert(alert.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Delete Alert"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Criteria */}
            <div className="space-y-2 text-xs">
              <div className="flex items-start space-x-2">
                <Code2 className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <div className="flex flex-wrap gap-1">
                  {alert.keywords.map((kw, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 font-medium">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300">
                  {alert.locations.length > 0 ? alert.locations.join(', ') : 'Any Location'}
                </span>
              </div>
            </div>

            {/* Notification Channels & Matched Count Footer */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px]">Channels:</span>
                <span className="text-slate-200 font-medium">{alert.channels.join(', ')}</span>
              </div>
              <div className="text-indigo-400 font-semibold flex items-center space-x-1">
                <Zap className="w-3.5 h-3.5" />
                <span>{alert.matchCount} jobs matched</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE ALERT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-5">
            <h2 className="text-lg font-bold text-white">Create New Real-Time Alert</h2>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Alert Rule Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pune Java Fresher"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Target Keywords (Comma Separated)</label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="Java, Spring Boot, Microservices"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Target Cities (Comma Separated)</label>
                <input
                  type="text"
                  value={locations}
                  onChange={(e) => setLocations(e.target.value)}
                  placeholder="Pune, Bengaluru, Hyderabad"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Dispatch Channels</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['in_app', 'browser', 'email', 'telegram'] as const).map((ch) => (
                    <button
                      type="button"
                      key={ch}
                      onClick={() => toggleChannel(ch)}
                      className={`p-2 rounded-lg border text-left flex items-center justify-between ${
                        channels.includes(ch)
                          ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="capitalize">{ch.replace('_', ' ')}</span>
                      {channels.includes(ch) && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
                >
                  Save &amp; Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
