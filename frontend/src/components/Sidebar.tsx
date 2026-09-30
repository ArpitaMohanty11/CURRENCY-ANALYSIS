import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import {
  LayoutDashboard,
  BarChart3,
  RefreshCw,
  LineChart,
  Star,
  BellRing,
  FileText,
  Sliders,
  ShieldCheck,
  Globe,
  Radio,
  ExternalLink,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, badge: 'LIVE' },
    { name: 'Currency Analytics', to: '/analytics', icon: BarChart3, badge: 'AI' },
    { name: 'Currency Converter', to: '/converter', icon: RefreshCw },
    { name: 'Historical Trends', to: '/trends', icon: LineChart },
    { name: 'Watchlists', to: '/watchlists', icon: Star },
    { name: 'FX Alerts', to: '/alerts', icon: BellRing },
    { name: 'Intelligence Reports', to: '/reports', icon: FileText, badge: 'PDF' },
    { name: 'Settings & Profile', to: '/settings', icon: Sliders },
  ];

  if (user?.role === 'admin') {
    navigation.push({ name: 'Admin Terminal', to: '/admin', icon: ShieldCheck, badge: 'SYS' });
  }

  return (
    <aside className="w-64 bg-[#070e1c] border-r border-[#1c2a47] flex flex-col justify-between shrink-0 select-none">
      {/* Navigation List */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[10px] font-mono tracking-wider text-slate-500 uppercase font-semibold">
          Terminal Modules
        </div>

        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.name}
              to={item.to}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0c1527]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    item.badge === 'LIVE'
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                      : item.badge === 'AI'
                      ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/80'
                      : item.badge === 'SYS'
                      ? 'bg-amber-950/80 text-amber-400 border border-amber-800/80'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}

        <div className="pt-4 px-3 text-[10px] font-mono tracking-wider text-slate-500 uppercase font-semibold">
          External
        </div>
        <NavLink
          to="/"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-[#0c1527] transition-all"
        >
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-slate-400" />
            <span>Public Showcase</span>
          </div>
          <ExternalLink className="w-3 h-3 text-slate-500" />
        </NavLink>
      </div>

      {/* Institutional System Status Card */}
      <div className="p-3 m-3 rounded-xl bg-[#0c1527] border border-[#1c2a47]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
            Engine Status
          </span>
          <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
            <Radio className="w-2.5 h-2.5 animate-pulse" />
            ONLINE
          </span>
        </div>
        <div className="space-y-1.5 text-[11px] font-mono">
          <div className="flex justify-between text-slate-400">
            <span>Sync Engine:</span>
            <span className="text-slate-200">APScheduler (15s)</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Database:</span>
            <span className="text-cyan-400">PostgreSQL / Supabase</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Security:</span>
            <span className="text-slate-200">JWT + RLS Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
