import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import {
  Sliders,
  User,
  ShieldCheck,
  Bell,
  RefreshCw,
  Key,
  Copy,
  Check,
  Save,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, updatePreferences } = useAuthStore();

  const [baseCurrency, setBaseCurrency] = useState(user?.preferences?.base_currency || 'USD');
  const [refreshInterval, setRefreshInterval] = useState(user?.preferences?.refresh_interval_seconds || 15);
  const [notifyEmail, setNotifyEmail] = useState(user?.preferences?.notification_email ?? true);
  const [notifyInApp, setNotifyInApp] = useState(user?.preferences?.notification_in_app ?? true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePreferences({
      base_currency: baseCurrency,
      refresh_interval_seconds: Number(refreshInterval),
      notification_email: notifyEmail,
      notification_in_app: notifyInApp,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText('cl_live_94f8a2bc9103e7a188df81c900e2');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c2a47] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-2.5">
            <span>Terminal Preferences & User Profile</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300">
              CUSTOM CONFIG
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Configure default portfolio base currency, live feed refresh polling rate, and API keys
          </p>
        </div>

        {savedSuccess && (
          <div className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 font-mono text-xs flex items-center gap-1.5 animate-fadeIn">
            <Check className="w-4 h-4" />
            <span>Preferences Saved!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-4 glass-panel p-5 rounded-2xl border border-[#1c2a47]">
          <div className="flex items-center gap-3 pb-4 border-b border-[#1c2a47] mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-white text-lg font-mono">
              {user?.full_name ? user.full_name[0] : 'T'}
            </div>
            <div>
              <h2 className="font-mono font-bold text-sm text-white">{user?.full_name}</h2>
              <div className="text-[11px] font-mono text-slate-400">{user?.email}</div>
              <span className="inline-block mt-1 text-[10px] font-mono uppercase font-bold px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
                ROLE: {user?.role}
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Account Status:</span>
              <span className="text-emerald-400 font-bold">ACTIVE (VERIFIED)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Member Since:</span>
              <span className="text-slate-200">{new Date(user?.created_at || '').toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Security Tier:</span>
              <span className="text-cyan-400">JWT + RLS Enabled</span>
            </div>
          </div>
        </div>

        {/* Preferences Form */}
        <div className="lg:col-span-8 glass-panel p-5 rounded-2xl border border-[#1c2a47]">
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">
                Default Portfolio Base Currency
              </label>
              <select
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value)}
                className="w-full bg-[#070e1c] border border-[#1c2a47] rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500 font-bold cursor-pointer"
              >
                <option value="USD">USD — United States Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="JPY">JPY — Japanese Yen</option>
                <option value="INR">INR — Indian Rupee</option>
                <option value="CHF">CHF — Swiss Franc</option>
              </select>
              <p className="text-[11px] font-mono text-slate-500 mt-1">
                All multi-currency valuations and cross-asset metrics default to this denomination.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono text-slate-400 uppercase">
                  Live Feed Poll Interval: <span className="text-cyan-400 font-bold">{refreshInterval} seconds</span>
                </label>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>5s (Ultra High-Frequency)</span>
                <span>15s (Default)</span>
                <span>60s (Standard)</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1c2a47] space-y-3">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase block mb-2">
                Notification Delivery Channels
              </span>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyInApp}
                  onChange={(e) => setNotifyInApp(e.target.checked)}
                  className="rounded bg-[#070e1c] border-[#1c2a47] text-cyan-500 focus:ring-0"
                />
                <span className="text-xs font-mono text-slate-300">
                  Real-time in-app audio & desktop toast notifications
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.checked)}
                  className="rounded bg-[#070e1c] border-[#1c2a47] text-cyan-500 focus:ring-0"
                />
                <span className="text-xs font-mono text-slate-300">
                  Send immediate email alerts when price breaches threshold
                </span>
              </label>
            </div>

            <div className="pt-3 border-t border-[#1c2a47] flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>SAVE PREFERENCES</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* API Key Management Card */}
      <div className="glass-panel p-5 rounded-2xl border border-[#1c2a47]">
        <div className="flex items-center justify-between border-b border-[#1c2a47] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Institutional API Credentials
            </span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded">
            REST & WebSocket Access
          </span>
        </div>

        <p className="text-xs text-slate-400 font-mono mb-4 leading-relaxed">
          Use this key in the <code className="text-cyan-300">Authorization: Bearer &lt;TOKEN&gt;</code> header to query live exchange rates, automated conversion pipelines, and historical OHLC series from custom Python or Node.js algorithms.
        </p>

        <div className="flex items-center gap-2 bg-[#070e1c] p-2.5 rounded-xl border border-[#1c2a47]">
          <input
            type="text"
            readOnly
            value="cl_live_94f8a2bc9103e7a188df81c900e2"
            className="w-full bg-transparent font-mono text-xs text-slate-300 focus:outline-none"
          />
          <button
            onClick={handleCopyKey}
            className="px-3 py-1.5 rounded-lg bg-[#111d33] hover:bg-[#1a2c4e] border border-[#1c2a47] text-xs font-mono text-cyan-300 font-semibold flex items-center gap-1.5 transition-colors"
          >
            {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey ? 'COPIED' : 'COPY'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
