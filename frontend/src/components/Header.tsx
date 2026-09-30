import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useCurrencyStore } from '../store/useCurrencyStore';
import { useWatchlistStore } from '../store/useWatchlistStore';
import {
  Activity,
  Bell,
  Search,
  User as UserIcon,
  LogOut,
  Settings,
  ShieldCheck,
  ChevronDown,
  Layers,
} from 'lucide-react';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { rates, setSelectedPair } = useCurrencyStore();
  const { alerts } = useWatchlistStore();

  const [utcTime, setUtcTime] = useState<string>('');
  const [localTime, setLocalTime] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().slice(17, 25) + ' UTC');
      setLocalTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredPairs = searchQuery
    ? rates.filter((r) => r.pair.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleSelectPair = (pair: string) => {
    setSelectedPair(pair);
    setSearchQuery('');
    setSearchOpen(false);
    navigate('/analytics');
  };

  return (
    <header className="h-16 bg-[#070e1c] border-b border-[#1c2a47] px-4 lg:px-6 flex items-center justify-between z-30 sticky top-0">
      {/* Brand & Market Clocks */}
      <div className="flex items-center gap-6">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 via-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white font-mono">
                Currency<span className="text-cyan-400">Lens</span>
              </span>
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 px-1.5 py-0.5 rounded">
                PRO
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono tracking-wider -mt-0.5">
              FX INTELLIGENCE TERMINAL
            </div>
          </div>
        </Link>

        {/* Institutional Market Clocks */}
        <div className="hidden xl:flex items-center gap-4 pl-6 border-l border-[#1c2a47]/80 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-live-dot" />
            <span className="text-slate-400">LONDON:</span>
            <span className="text-slate-200 font-semibold">{utcTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-live-dot" />
            <span className="text-slate-400">DESK:</span>
            <span className="text-slate-200 font-semibold">{localTime}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#0c1527] px-2.5 py-1 rounded border border-[#1c2a47]">
            <span className="text-slate-400 text-[11px]">USD (DXY):</span>
            <span className="text-emerald-400 font-bold text-[11px]">104.28</span>
            <span className="text-[10px] text-emerald-400 font-semibold">(+0.18%)</span>
          </div>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="relative flex-1 max-w-md mx-6 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search FX cross (e.g. EUR/USD, GBP/JPY)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            className="w-full bg-[#0c1527] border border-[#1c2a47] rounded-lg pl-9 pr-12 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-[#16223b] px-1.5 py-0.5 rounded border border-[#203152]">
            /
          </kbd>
        </div>

        {/* Autocomplete Dropdown */}
        {searchOpen && searchQuery && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#0c1527] border border-[#1c2a47] rounded-lg shadow-2xl py-1 z-50 max-h-60 overflow-y-auto">
            {filteredPairs.length > 0 ? (
              filteredPairs.map((r) => (
                <div
                  key={r.pair}
                  onClick={() => handleSelectPair(r.pair)}
                  className="px-3 py-2 hover:bg-[#14213d] flex items-center justify-between cursor-pointer border-b border-[#1c2a47]/40 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-200">{r.pair}</span>
                    <span className="text-[11px] text-slate-400 font-mono">Spot</span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xs font-semibold text-white">{r.rate.toFixed(4)}</div>
                    <div className={`text-[10px] font-mono ${r.change_pct_24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {r.change_pct_24h >= 0 ? '+' : ''}{r.change_pct_24h.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 text-xs text-slate-400 text-center font-mono">No matching currency pairs found.</div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls & Profile */}
      <div className="flex items-center gap-3">
        {/* Alerts Bell */}
        <Link
          to="/alerts"
          className="relative p-2 rounded-lg bg-[#0c1527] border border-[#1c2a47] hover:border-cyan-500/50 text-slate-300 hover:text-cyan-400 transition-colors"
          title="Active FX Price Alerts"
        >
          <Bell className="w-4 h-4" />
          {alerts.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-black text-[9px] font-bold rounded-full flex items-center justify-center font-mono">
              {alerts.length}
            </span>
          )}
        </Link>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserDropdown(!userDropdown)}
            className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-lg bg-[#0c1527] border border-[#1c2a47] hover:border-slate-600 transition-all text-left"
          >
            <div className="w-7 h-7 rounded bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-white text-xs">
              {user?.full_name ? user.full_name[0] : 'T'}
            </div>
            <div className="hidden md:block">
              <div className="text-xs font-semibold text-slate-200 leading-tight">
                {user?.full_name || 'Institutional Trader'}
              </div>
              <div className="text-[10px] font-mono uppercase text-cyan-400 font-medium">
                {user?.role || 'trader'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {userDropdown && (
            <div
              className="absolute right-0 top-full mt-2 w-56 bg-[#0c1527] border border-[#1c2a47] rounded-xl shadow-2xl py-1.5 z-50 text-xs"
              onClick={() => setUserDropdown(false)}
            >
              <div className="px-3 py-2 border-b border-[#1c2a47] mb-1">
                <div className="font-semibold text-slate-200">{user?.full_name}</div>
                <div className="text-[11px] text-slate-400 font-mono truncate">{user?.email}</div>
              </div>

              <Link
                to="/settings"
                className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#14213d] text-slate-300 hover:text-white"
              >
                <Settings className="w-4 h-4 text-cyan-400" />
                <span>Terminal Preferences</span>
              </Link>

              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#14213d] text-slate-300 hover:text-white"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Admin Terminal</span>
                </Link>
              )}

              <div className="border-t border-[#1c2a47] my-1" />

              <button
                onClick={logout}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 text-left"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Disconnect Terminal</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
