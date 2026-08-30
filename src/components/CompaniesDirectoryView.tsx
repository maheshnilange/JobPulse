import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  ExternalLink, 
  Search, 
  CheckCircle2, 
  Briefcase, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Company } from '../types';

interface CompaniesDirectoryViewProps {
  companies: Company[];
  onSelectCompany: (companyName: string) => void;
}

export const CompaniesDirectoryView: React.FC<CompaniesDirectoryViewProps> = ({
  companies,
  onSelectCompany
}) => {
  const [search, setSearch] = useState('');

  const filtered = companies.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.industry.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>20+ MONITORED ENTERPRISE CAREER PORTALS</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Tracked Tech Giants &amp; IT Service Leaders
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Direct integration with official career engines to detect NQT, GET, ASE, and Java developer drives.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((company) => (
          <div
            key={company.id}
            id={`company-card-${company.id}`}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-indigo-500/50 transition-all shadow-md group relative"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {company.name}
                  </h3>
                  {company.verified && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" title="Verified Official Career Source" />
                  )}
                </div>
                <div className="text-xs text-slate-400">{company.industry}</div>
              </div>

              <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                company.activeOpeningsCount > 0
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {company.activeOpeningsCount} Active
              </span>
            </div>

            <div className="text-xs text-slate-400 font-mono">
              {company.officialDomain}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => onSelectCompany(company.name)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
              >
                <span>View Job Openings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <a
                href={company.careersUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Open Official Careers Portal"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
