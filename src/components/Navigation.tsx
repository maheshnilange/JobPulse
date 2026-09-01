import React from 'react';
import { 
  LayoutDashboard, 
  Flame, 
  GraduationCap, 
  Code2, 
  Cpu, 
  Users, 
  Building2, 
  BellRing, 
  FolderHeart, 
  Settings2,
  FileCode2,
  Mail
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  todayCount?: number;
  walkInCount?: number;
  fresherCount?: number;
  javaCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  todayCount = 0,
  walkInCount = 0,
  fresherCount = 0,
  javaCount = 0
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'latest', label: 'Latest Jobs', icon: Flame, badge: '🔥 New' },
    { id: 'fresher', label: 'Fresher Jobs', icon: GraduationCap, count: fresherCount },
    { id: 'java', label: 'Java Jobs', icon: Code2, count: javaCount },
    { id: 'software', label: 'Software Jobs', icon: Cpu },
    { id: 'walkins', label: 'Walk-In Drives', icon: Users, badge: `${walkInCount} Active`, isSpecial: true },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'alerts', label: 'My Alerts', icon: BellRing },
    { id: 'saved', label: 'Saved & Tracker', icon: FolderHeart },
    { id: 'gmail-tracker', label: 'Gmail Tracker', icon: Mail, badge: 'Gmail Sync' },
    { id: 'admin', label: 'Admin & Sources', icon: Settings2 },
    { id: 'api-tests', label: 'API & Tests', icon: FileCode2 }
  ];

  return (
    <nav id="main-navigation-bar" className="bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-[95px] z-30 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 py-2 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all relative ${
                  isActive
                    ? item.isSpecial
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
                      : 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                    : item.isSpecial
                    ? 'text-amber-400 hover:bg-amber-500/10 hover:text-amber-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? (item.isSpecial ? 'text-amber-300' : 'text-white') : 'text-slate-400'}`} />
                <span>{item.label}</span>

                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                    item.isSpecial
                      ? 'bg-amber-500/30 text-amber-200 border border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}

                {item.count !== undefined && item.count > 0 && !item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
