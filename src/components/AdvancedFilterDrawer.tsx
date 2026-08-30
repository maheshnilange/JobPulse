import React from 'react';
import { X, SlidersHorizontal, RotateCcw, Check } from 'lucide-react';
import { FilterParams } from '../types';

interface AdvancedFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterParams;
  setFilters: React.Dispatch<React.SetStateAction<FilterParams>>;
}

export const AdvancedFilterDrawer: React.FC<AdvancedFilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  setFilters
}) => {
  if (!isOpen) return null;

  const locations = ['All', 'Pune', 'Bengaluru', 'Hyderabad', 'Chennai', 'Mumbai', 'Noida', 'Gurugram', 'Delhi NCR', 'Kolkata'];
  const workModes = ['All', 'Remote', 'Hybrid', 'On-site'];
  const degrees = ['All', 'B.E', 'B.Tech', 'MCA', 'BCA', 'B.Sc CS', 'M.Tech'];
  const graduationYears = [2026, 2025, 2024, 2023];
  const techStacks = ['All', 'Java', 'Spring Boot', 'Core Java', 'Microservices', 'SQL', 'Hibernate', 'React', 'REST API', 'AWS'];
  const freshnessOptions = [
    { label: 'Any Time', value: 'all' },
    { label: '🔥 Last 15 Mins', value: '15m' },
    { label: '🔥 Last 30 Mins', value: '30m' },
    { label: '⚡ Last 1 Hour', value: '1h' },
    { label: '⏳ Last 6 Hours', value: '6h' },
    { label: '📅 Last 24 Hours', value: '24h' }
  ];

  const handleReset = () => {
    setFilters({});
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Advanced Search &amp; Filters</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Scrollable Form */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs text-slate-300">
          {/* Freshness Window */}
          <div className="space-y-2">
            <label className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Detected Within
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {freshnessOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilters(prev => ({ ...prev, postedWithin: opt.value as any }))}
                  className={`px-2.5 py-2 rounded-lg text-left border transition-all ${
                    (filters.postedWithin === opt.value) || (!filters.postedWithin && opt.value === 'all')
                      ? 'bg-indigo-600 text-white border-indigo-500 font-semibold'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Location / Tech City
            </label>
            <div className="flex flex-wrap gap-1.5">
              {locations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => setFilters(prev => ({ ...prev, location: loc === 'All' ? '' : loc }))}
                  className={`px-2.5 py-1.5 rounded-lg border transition-all ${
                    (!filters.location && loc === 'All') || filters.location === loc
                      ? 'bg-indigo-600 text-white border-indigo-500 font-semibold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div className="space-y-2">
            <label className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Technology / Skill Required
            </label>
            <div className="flex flex-wrap gap-1.5">
              {techStacks.map((tech) => (
                <button
                  key={tech}
                  onClick={() => setFilters(prev => ({ ...prev, technology: tech === 'All' ? '' : tech }))}
                  className={`px-2.5 py-1.5 rounded-lg border transition-all ${
                    (!filters.technology && tech === 'All') || filters.technology === tech
                      ? 'bg-amber-600 text-white border-amber-500 font-semibold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
          </div>

          {/* Graduation Batches */}
          <div className="space-y-2">
            <label className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Graduation Year / Batch
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {graduationYears.map((yr) => (
                <button
                  key={yr}
                  onClick={() => setFilters(prev => ({ ...prev, graduationYear: prev.graduationYear === yr ? undefined : yr }))}
                  className={`py-2 rounded-lg text-center border font-semibold transition-all ${
                    filters.graduationYear === yr
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>

          {/* Degree */}
          <div className="space-y-2">
            <label className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Eligible Degree
            </label>
            <div className="flex flex-wrap gap-1.5">
              {degrees.map((deg) => (
                <button
                  key={deg}
                  onClick={() => setFilters(prev => ({ ...prev, degree: deg === 'All' ? '' : deg }))}
                  className={`px-2.5 py-1.5 rounded-lg border transition-all ${
                    (!filters.degree && deg === 'All') || filters.degree === deg
                      ? 'bg-indigo-600 text-white border-indigo-500 font-semibold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {deg}
                </button>
              ))}
            </div>
          </div>

          {/* Work Mode */}
          <div className="space-y-2">
            <label className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Work Mode
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {workModes.map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFilters(prev => ({ ...prev, workMode: mode === 'All' ? '' : mode }))}
                  className={`py-2 rounded-lg text-center border transition-all ${
                    (!filters.workMode && mode === 'All') || filters.workMode === mode
                      ? 'bg-indigo-600 text-white border-indigo-500 font-semibold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
