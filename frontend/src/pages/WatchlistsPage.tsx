import React, { useState, useEffect } from 'react';
import { useWatchlistStore } from '../store/useWatchlistStore';
import { useCurrencyStore } from '../store/useCurrencyStore';
import { Sparkline } from '../components/Sparkline';
import {
  Star,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Layers,
  FolderPlus,
  X,
  ChevronRight,
} from 'lucide-react';

export const WatchlistsPage: React.FC = () => {
  const { watchlists, fetchWatchlists, createWatchlist, addPairToWatchlist, removeItemFromWatchlist, deleteWatchlist } =
    useWatchlistStore();
  const { rates, setSelectedPair } = useCurrencyStore();

  const [activeWatchlistId, setActiveWatchlistId] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddPairModal, setShowAddPairModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [selectedBase, setSelectedBase] = useState('EUR');
  const [selectedTarget, setSelectedTarget] = useState('USD');

  useEffect(() => {
    fetchWatchlists();
  }, []);

  useEffect(() => {
    if (watchlists.length > 0 && !activeWatchlistId) {
      setActiveWatchlistId(watchlists[0].id);
    }
  }, [watchlists]);

  const activeWatchlist = watchlists.find((w) => w.id === activeWatchlistId) || watchlists[0];

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    await createWatchlist(newListName, newListDesc);
    setNewListName('');
    setNewListDesc('');
    setShowCreateModal(false);
  };

  const handleAddPair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWatchlist) return;
    await addPairToWatchlist(activeWatchlist.id, selectedBase, selectedTarget);
    setShowAddPairModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c2a47] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-2.5">
            <span>Portfolio FX Watchlists</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300">
              CUSTOM BASKETS
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Curate targeted currency baskets, monitor real-time correlation moves, and track custom portfolios
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold shadow-lg shadow-cyan-500/20 transition-all"
        >
          <FolderPlus className="w-4 h-4" />
          <span>New Watchlist</span>
        </button>
      </div>

      {/* Watchlist Tabs & Current Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1c2a47] pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {watchlists.map((w) => (
            <button
              key={w.id}
              onClick={() => setActiveWatchlistId(w.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap ${
                activeWatchlistId === w.id
                  ? 'bg-cyan-500/20 border border-cyan-500/60 text-cyan-300'
                  : 'bg-[#0c1527] border border-[#1c2a47] text-slate-400 hover:text-white'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${activeWatchlistId === w.id ? 'fill-cyan-400 text-cyan-400' : 'text-slate-500'}`} />
              <span>{w.name}</span>
              <span className="text-[10px] opacity-60">({w.items?.length || 0})</span>
            </button>
          ))}
        </div>

        {activeWatchlist && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddPairModal(true)}
              className="px-3 py-1.5 rounded-lg bg-[#0c1527] hover:bg-[#14213d] border border-[#1c2a47] text-xs font-mono text-cyan-300 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Currency Pair</span>
            </button>
            {watchlists.length > 1 && (
              <button
                onClick={() => deleteWatchlist(activeWatchlist.id)}
                className="p-1.5 rounded-lg bg-[#0c1527] hover:bg-rose-950/60 border border-[#1c2a47] text-slate-400 hover:text-rose-400 transition-colors"
                title="Delete Watchlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Active Watchlist Items Grid */}
      {activeWatchlist && (
        <div className="glass-panel p-5 rounded-2xl border border-[#1c2a47]">
          <div className="mb-4">
            <h2 className="text-base font-bold font-mono text-white">{activeWatchlist.name}</h2>
            {activeWatchlist.description && (
              <p className="text-xs text-slate-400 font-mono mt-0.5">{activeWatchlist.description}</p>
            )}
          </div>

          {activeWatchlist.items && activeWatchlist.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-xs text-left">
                <thead>
                  <tr className="border-b border-[#1c2a47] text-slate-400 text-[11px]">
                    <th className="pb-2.5">CROSS PAIR</th>
                    <th className="pb-2.5">SPOT RATE</th>
                    <th className="pb-2.5">BID / ASK</th>
                    <th className="pb-2.5">24H CHANGE</th>
                    <th className="pb-2.5">24H HIGH / LOW</th>
                    <th className="pb-2.5">MICRO TREND</th>
                    <th className="pb-2.5 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c2a47]/40">
                  {activeWatchlist.items.map((item) => {
                    const rateObj = rates.find((r) => r.pair === item.pair) || item.rate_info || {
                      rate: 1.0845,
                      bid: 1.0844,
                      ask: 1.0846,
                      change_pct_24h: 0.35,
                      high_24h: 1.0890,
                      low_24h: 1.0810,
                    };
                    const isPos = (rateObj.change_pct_24h || 0) >= 0;

                    return (
                      <tr key={item.id} className="hover:bg-[#14213d]/40 transition-colors">
                        <td className="py-3">
                          <button
                            onClick={() => setSelectedPair(item.pair)}
                            className="font-bold text-sm text-cyan-300 hover:underline flex items-center gap-1.5"
                          >
                            <span>{item.pair}</span>
                          </button>
                        </td>
                        <td className="py-3 text-white font-bold text-sm">{rateObj.rate.toFixed(4)}</td>
                        <td className="py-3 text-slate-400">
                          {rateObj.bid.toFixed(4)} / {rateObj.ask.toFixed(4)}
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                              isPos ? 'text-emerald-400 bg-emerald-950/80' : 'text-rose-400 bg-rose-950/80'
                            }`}
                          >
                            {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {isPos ? '+' : ''}{(rateObj.change_pct_24h || 0).toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-3 text-slate-400 text-[11px]">
                          {rateObj.high_24h?.toFixed(4)} / {rateObj.low_24h?.toFixed(4)}
                        </td>
                        <td className="py-3">
                          <Sparkline isPositive={isPos} width={75} height={20} />
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => removeItemFromWatchlist(activeWatchlist.id, item.id)}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                            title="Remove from watchlist"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-xs font-mono text-slate-500 border border-dashed border-[#1c2a47] rounded-xl">
              No pairs tracked in this watchlist yet. Click "+ Add Currency Pair" above.
            </div>
          )}
        </div>
      )}

      {/* Create Watchlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1527] border border-[#1c2a47] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c2a47] mb-4">
              <span className="font-mono font-bold text-sm text-white">Create New Portfolio Watchlist</span>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateList} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">Watchlist Name</label>
                <input
                  type="text"
                  required
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="e.g. Emerging Markets FX"
                  className="w-full bg-[#070e1c] border border-[#1c2a47] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">Description (Optional)</label>
                <input
                  type="text"
                  value={newListDesc}
                  onChange={(e) => setNewListDesc(e.target.value)}
                  placeholder="e.g. Core crosses monitored for carry trade yield"
                  className="w-full bg-[#070e1c] border border-[#1c2a47] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#070e1c] border border-[#1c2a47] text-xs font-mono text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs shadow-md shadow-cyan-500/20"
                >
                  Create Watchlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Pair Modal */}
      {showAddPairModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1527] border border-[#1c2a47] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c2a47] mb-4">
              <span className="font-mono font-bold text-sm text-white">Add Pair to {activeWatchlist?.name}</span>
              <button onClick={() => setShowAddPairModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddPair} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">Base Currency</label>
                  <select
                    value={selectedBase}
                    onChange={(e) => setSelectedBase(e.target.value)}
                    className="w-full bg-[#070e1c] border border-[#1c2a47] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    {['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'INR', 'CNY'].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">Target Currency</label>
                  <select
                    value={selectedTarget}
                    onChange={(e) => setSelectedTarget(e.target.value)}
                    className="w-full bg-[#070e1c] border border-[#1c2a47] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    {['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'INR', 'CNY', 'NZD', 'BRL'].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#070e1c] text-xs font-mono text-slate-400">
                Adding Cross: <span className="text-cyan-400 font-bold">{selectedBase}/{selectedTarget}</span>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPairModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#070e1c] border border-[#1c2a47] text-xs font-mono text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs shadow-md shadow-cyan-500/20"
                >
                  Confirm & Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
