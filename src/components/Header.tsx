import React from 'react';
import { 
  Radio, 
  Bell, 
  Search, 
  Sparkles, 
  RotateCw, 
  ShieldCheck, 
  SlidersHorizontal,
  Bookmark,
  FileText,
  Mail
} from 'lucide-react';
import { NotificationItem, SavedJobItem } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  notifications: NotificationItem[];
  savedJobs: SavedJobItem[];
  onOpenNotifications: () => void;
  onOpenFilterDrawer: () => void;
  onOpenResumeProfile?: () => void;
  onTriggerCrawl: () => void;
  isCrawling: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  notifications,
  savedJobs,
  onOpenNotifications,
  onOpenFilterDrawer,
  onOpenResumeProfile,
  onTriggerCrawl,
  isCrawling
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header id="jobpulse-header" className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      {/* Top Ticker & Real-Time Status Bar */}
      <div className="bg-slate-950 px-4 py-1.5 text-xs border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="tracking-wide">REAL-TIME MONITOR ACTIVE</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <p className="text-slate-400 truncate hidden md:inline">
            Continuously polling 20+ top IT career portals &amp; verified feeds for Freshers, Java &amp; Software Engineer roles.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-slate-400">
          <button 
            id="header-manual-crawl-btn"
            onClick={onTriggerCrawl}
            disabled={isCrawling}
            className="flex items-center space-x-1 hover:text-indigo-300 transition-colors disabled:opacity-50"
            title="Trigger real-time check across all active sources"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isCrawling ? 'animate-spin text-indigo-400' : ''}`} />
            <span className="hidden sm:inline">{isCrawling ? 'Checking feeds...' : 'Check Feeds Now'}</span>
          </button>
          <span className="text-slate-700">|</span>
          <div className="flex items-center space-x-1 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Source Verified</span>
          </div>
        </div>
      </div>

      {/* Main Header Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          id="brand-logo-btn"
          onClick={() => setActiveTab('dashboard')} 
          className="flex items-center space-x-3 cursor-pointer group flex-shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
                JobPulse
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal leading-none hidden sm:block mt-0.5">
              Fresher &amp; Software Job Aggregator
            </p>
          </div>
        </div>

        {/* Global Quick Search Bar */}
        <div className="flex-1 max-w-xl relative">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role, company, Java, Spring Boot, Pune, Bengaluru..."
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg pl-10 pr-24 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <button
              id="filter-drawer-toggle-btn"
              onClick={onOpenFilterDrawer}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center space-x-1 transition-colors"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          {/* Resume / Profile Button */}
          <button
            id="header-resume-profile-btn"
            onClick={onOpenResumeProfile}
            className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            title="My Candidate Resume & 1-Click Profile"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">My Resume</span>
          </button>

          {/* Saved Jobs Quick Button */}
          <button
            id="header-saved-jobs-btn"
            onClick={() => setActiveTab('saved')}
            className={`p-2 rounded-lg border transition-colors relative ${
              activeTab === 'saved' 
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300' 
                : 'bg-slate-800 border-slate-700/80 text-slate-300 hover:bg-slate-700'
            }`}
            title="Saved Jobs & Application Tracker"
          >
            <Bookmark className="w-4 h-4" />
            {savedJobs.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {savedJobs.length}
              </span>
            )}
          </button>

          {/* Gmail Tracker Quick Button */}
          <button
            id="header-gmail-tracker-btn"
            onClick={() => setActiveTab('gmail-tracker')}
            className={`p-2 rounded-lg border transition-colors relative ${
              activeTab === 'gmail-tracker' 
                ? 'bg-red-500/20 border-red-500/40 text-red-300' 
                : 'bg-slate-800 border-slate-700/80 text-slate-300 hover:bg-slate-700'
            }`}
            title="Gmail Notifications & Status Tracking"
          >
            <Mail className="w-4 h-4 text-red-400" />
          </button>

          {/* Notifications Drawer Toggle */}
          <button
            id="header-notifications-btn"
            onClick={onOpenNotifications}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700/80 text-slate-300 hover:bg-slate-700 transition-colors relative"
            title="Job Alerts & Real-time Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Admin / Portal Mode Indicator */}
          <button
            id="header-admin-portal-btn"
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center space-x-1.5 transition-all ${
              activeTab === 'admin'
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Admin Center</span>
          </button>
        </div>
      </div>
    </header>
  );
};
