import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  ShieldCheck,
  Activity,
  Cpu,
  Server,
  RefreshCw,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Terminal,
} from 'lucide-react';
import { SystemHealth, AuditLog } from '../types';

export const AdminPage: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [hRes, jRes, uRes, lRes] = await Promise.all([
        api.admin.getHealth(),
        api.admin.getJobs(),
        api.admin.getUsers(),
        api.admin.getLogs(),
      ]);
      setHealth(hRes);
      setJobs(jRes);
      setUsers(uRes);
      setLogs(lRes);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleManualSync = async () => {
    try {
      const res = await api.admin.triggerSync();
      setSyncStatus(res.message);
      setTimeout(() => setSyncStatus(null), 4000);
      fetchAdminData();
    } catch (err) {
      console.error('Manual sync failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c2a47] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-2.5">
            <span>Institutional Admin & Cluster Supervisor</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800 text-amber-300">
              RESTRICTED
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            APScheduler job telemetry, Supabase database status, cluster uptime, and audit logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          {syncStatus && (
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800">
              {syncStatus}
            </span>
          )}
          <button
            onClick={handleManualSync}
            className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>Force Rate Sync Job</span>
          </button>
        </div>
      </div>

      {/* Health Metrics Grid */}
      {health && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-xl border border-[#1c2a47]">
            <span className="text-[10px] font-mono text-slate-400 uppercase">System Status</span>
            <div className="text-xl font-mono font-bold text-emerald-400 mt-1 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{health.status}</span>
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-0.5">Uptime: {health.uptime_seconds}s</div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-[#1c2a47]">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Database Link</span>
            <div className="text-sm font-mono font-bold text-white mt-1.5 truncate">
              {health.database}
            </div>
            <div className="text-[10px] font-mono text-cyan-400 mt-0.5">RLS & Pooling Online</div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-[#1c2a47]">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Rates Feed Cache</span>
            <div className="text-xl font-mono font-bold text-white mt-1">{health.rates_cached_count} Pairs</div>
            <div className="text-[10px] font-mono text-slate-500 mt-0.5">High-Frequency Memory Cache</div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-[#1c2a47]">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Background Scheduler</span>
            <div className="text-xl font-mono font-bold text-cyan-400 mt-1">
              {health.scheduler_running ? 'APScheduler Active' : 'Stopped'}
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-0.5">{jobs.length} Active Cron Triggers</div>
          </div>
        </div>
      )}

      {/* Background Jobs Inspector */}
      <div className="glass-panel p-5 rounded-2xl border border-[#1c2a47]">
        <div className="flex items-center justify-between border-b border-[#1c2a47] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              APScheduler Daemon Job Pipeline
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
            AsyncIO Reactor
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs text-left">
            <thead>
              <tr className="border-b border-[#1c2a47] text-slate-400 text-[11px]">
                <th className="pb-2">JOB ID</th>
                <th className="pb-2">DESCRIPTION</th>
                <th className="pb-2">TRIGGER INTERVAL</th>
                <th className="pb-2">STATUS</th>
                <th className="pb-2 text-right">NEXT EXECUTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c2a47]/40">
              {jobs.map((j) => (
                <tr key={j.id} className="hover:bg-[#14213d]/40">
                  <td className="py-2.5 font-bold text-cyan-400">{j.id}</td>
                  <td className="py-2.5 text-slate-200">{j.name}</td>
                  <td className="py-2.5 text-slate-400">{j.trigger}</td>
                  <td className="py-2.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {j.status}
                    </span>
                  </td>
                  <td className="py-2.5 text-right text-slate-300">
                    {j.next_run_time ? new Date(j.next_run_time).toLocaleTimeString() : 'Immediate'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row: User Accounts & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User Management */}
        <div className="lg:col-span-6 glass-panel p-5 rounded-2xl border border-[#1c2a47]">
          <div className="flex items-center justify-between border-b border-[#1c2a47] pb-3 mb-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Registered Accounts ({users.length})
            </span>
            <span className="text-[10px] font-mono text-slate-400">Role-Based Access</span>
          </div>

          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u.id}
                className="p-3 rounded-xl bg-[#070e1c] border border-[#1c2a47] flex items-center justify-between text-xs font-mono"
              >
                <div>
                  <div className="font-bold text-white">{u.full_name}</div>
                  <div className="text-[11px] text-slate-400">{u.email}</div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Portfolios: {u.watchlists_count} · Alerts: {u.alerts_count}
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      u.role === 'admin'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                    }`}
                  >
                    {u.role}
                  </span>
                  <div className="text-[10px] text-emerald-400 mt-1">ACTIVE</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Logs */}
        <div className="lg:col-span-6 glass-panel p-5 rounded-2xl border border-[#1c2a47]">
          <div className="flex items-center justify-between border-b border-[#1c2a47] pb-3 mb-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              System Audit Trail Log
            </span>
            <span className="text-[10px] font-mono text-slate-400">Security Events</span>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {logs.length > 0 ? (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg bg-[#070e1c] border border-[#1c2a47] text-xs font-mono"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-bold text-cyan-400">{log.action}</span>
                    <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    Resource: <span className="text-slate-400">{log.resource_type}</span>{' '}
                    {log.resource_id && `(${log.resource_id.slice(0, 8)}...)`}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs font-mono text-slate-500">
                No recent security audit logs.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
