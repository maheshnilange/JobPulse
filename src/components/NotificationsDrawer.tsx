import React from 'react';
import { X, Bell, Check, ExternalLink, Sparkles, Building2, MapPin, CheckCheck } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onSelectJobById: (jobId: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onSelectJobById
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Live Job Alerts Feed</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
              {notifications.filter(n => !n.read).length} Unread
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onMarkAllRead}
              className="p-1 text-slate-400 hover:text-indigo-300 transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {notifications.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <Bell className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-sm font-semibold text-slate-300">No Notifications Yet</div>
              <p className="text-xs text-slate-500">
                You'll receive alerts as soon as new jobs matching your criteria are crawled.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                id={`notification-item-${n.id}`}
                onClick={() => {
                  if (!n.read) onMarkRead(n.id);
                  onSelectJobById(n.jobId);
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-2 ${
                  n.read
                    ? 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                    : 'bg-indigo-950/20 border-indigo-500/40 text-slate-200 shadow-md shadow-indigo-500/5'
                }`}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-rose-400 flex items-center space-x-1">
                    <span>{n.title}</span>
                  </span>
                  <span className="text-slate-400">
                    {new Date(n.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white">{n.role}</div>
                  <div className="text-xs text-indigo-300 font-semibold">{n.companyName}</div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                  <span>{n.location} • {n.experience}</span>
                  <span className="text-emerald-400 font-semibold">{n.salary}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
