import React, { useState, useEffect } from 'react';
import { useWatchlistStore } from '../store/useWatchlistStore';
import { useCurrencyStore } from '../store/useCurrencyStore';
import {
  BellRing,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Zap,
  TrendingUp,
  TrendingDown,
  Volume2,
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const { alerts, alertHistory, fetchAlerts, fetchAlertHistory, createAlert, toggleAlert, deleteAlert } =
    useWatchlistStore();
  const { rates } = useCurrencyStore();

  const [baseCurr, setBaseCurr] = useState('USD');
  const [targetCurr, setTargetCurr] = useState('JPY');
  const [triggerType, setTriggerType] = useState('ABOVE');
  const [targetRate, setTargetRate] = useState('155.00');
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  useEffect(() => {
    fetchAlerts();
    fetchAlertHistory();
  }, []);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRate) return;
    await createAlert(baseCurr, targetCurr, triggerType, parseFloat(targetRate));
    setNotificationToast(`Alert armed: ${baseCurr}/${targetCurr} ${triggerType} ${targetRate}`);
    setTimeout(() => setNotificationToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notificationToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-cyan-950 border border-cyan-500 text-white shadow-2xl flex items-center gap-3 animate-bounce">
          <Volume2 className="w-5 h-5 text-cyan-400" />
          <div className="font-mono text-xs font-semibold">{notificationToast}</div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c2a47] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-2.5">
            <span>Foreign Exchange Price Alerts & Trigger Engine</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800 text-amber-300">
              LOW-LATENCY
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Automated monitoring by APScheduler background daemon evaluating live tick feeds every 30 seconds
          </p>
        </div>
      </div>

      {/* Create Alert Form Card */}
      <div className="glass-panel p-5 rounded-2xl border border-[#1c2a47]">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#1c2a47]">
          <Plus className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            Arm New Price Trigger
          </span>
        </div>

        <form onSubmit={handleCreateAlert} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Base Currency</label>
            <select
              value={baseCurr}
              onChange={(e) => setBaseCurr(e.target.value)}
              className="w-full bg-[#070e1c] border border-[#1c2a47] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
            >
              {['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'INR', 'CNY'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Target Currency</label>
            <select
              value={targetCurr}
              onChange={(e) => setTargetCurr(e.target.value)}
              className="w-full bg-[#070e1c] border border-[#1c2a47] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
            >
              {['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'INR', 'CNY', 'NZD'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Trigger Condition</label>
            <select
              value={triggerType}
              onChange={(e) => setTriggerType(e.target.value)}
              className="w-full bg-[#070e1c] border border-[#1c2a47] rounded-xl px-3 py-2 text-xs font-mono text-cyan-400 font-semibold focus:outline-none focus:border-cyan-500"
            >
              <option value="ABOVE">Rate Rises Above (≥)</option>
              <option value="BELOW">Rate Falls Below (≤)</option>
              <option value="PCT_CHANGE_UP">24h Surge % (≥)</option>
              <option value="PCT_CHANGE_DOWN">24h Drop % (≤)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Target Threshold</label>
            <input
              type="number"
              step="any"
              required
              value={targetRate}
              onChange={(e) => setTargetRate(e.target.value)}
              placeholder="e.g. 155.00"
              className="w-full bg-[#070e1c] border border-[#1c2a47] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500 font-bold"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5 transition-all"
            >
              <Zap className="w-4 h-4" />
              <span>ARM ALERT</span>
            </button>
          </div>
        </form>
      </div>

      {/* Row: Active Alerts & Trigger History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Alerts Table */}
        <div className="lg:col-span-7 glass-panel p-5 rounded-2xl border border-[#1c2a47]">
          <div className="flex items-center justify-between border-b border-[#1c2a47] pb-3 mb-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Active Trigger Monitors ({alerts.length})
            </span>
            <span className="text-[10px] font-mono text-emerald-400">Monitoring Online</span>
          </div>

          <div className="space-y-2.5">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3.5 rounded-xl bg-[#070e1c] border border-[#1c2a47] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono text-xs ${
                        alert.trigger_type.includes('ABOVE') || alert.trigger_type.includes('UP')
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950/80 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {alert.trigger_type.includes('ABOVE') || alert.trigger_type.includes('UP') ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="font-mono font-bold text-sm text-white">
                        {alert.pair}{' '}
                        <span className="text-cyan-400 text-xs font-semibold">
                          {alert.trigger_type} {alert.target_rate}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        Current: {alert.current_rate?.toFixed(4) || '—'} · Triggered: {alert.triggered_count} times
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Toggle button */}
                    <button
                      onClick={() => toggleAlert(alert.id, !alert.is_active)}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-all ${
                        alert.is_active
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {alert.is_active ? 'ARMED' : 'PAUSED'}
                    </button>

                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete trigger"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs font-mono text-slate-500">
                No active price alerts armed.
              </div>
            )}
          </div>
        </div>

        {/* Triggered Alert History */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-2xl border border-[#1c2a47]">
          <div className="flex items-center justify-between border-b border-[#1c2a47] pb-3 mb-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Trigger Execution History Log
            </span>
            <span className="text-[10px] font-mono text-slate-400">Audit Trail</span>
          </div>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {alertHistory.length > 0 ? (
              alertHistory.map((hist) => (
                <div
                  key={hist.id}
                  className="p-3 rounded-lg bg-[#070e1c] border border-[#1c2a47] text-xs font-mono"
                >
                  <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                    <span className="font-bold text-amber-400">{hist.pair}</span>
                    <span>{new Date(hist.created_at).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-slate-200 text-[11px] leading-tight mb-1.5 font-semibold">
                    {hist.message}
                  </div>
                  <div className="text-[10px] text-slate-500 flex justify-between">
                    <span>Target: {hist.target_rate}</span>
                    <span className="text-emerald-400">Triggered: {hist.triggered_rate.toFixed(4)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs font-mono text-slate-500">
                No recent alert executions in audit history.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
