import React from 'react';
import { useCurrencyStore } from '../store/useCurrencyStore';
import { TrendingUp, TrendingDown, Radio } from 'lucide-react';

export const TickerTape: React.FC = () => {
  const { rates, isLiveConnected, setSelectedPair } = useCurrencyStore();

  const displayRates = rates.length > 0 ? rates : [
    { pair: 'EUR/USD', rate: 1.0845, change_pct_24h: 0.35 },
    { pair: 'GBP/USD', rate: 1.2670, change_pct_24h: -0.18 },
    { pair: 'USD/JPY', rate: 154.32, change_pct_24h: 0.54 },
    { pair: 'USD/INR', rate: 86.42, change_pct_24h: 0.12 },
    { pair: 'USD/CHF', rate: 0.8840, change_pct_24h: -0.22 },
    { pair: 'AUD/USD', rate: 0.6528, change_pct_24h: 0.48 },
    { pair: 'USD/CAD', rate: 1.3785, change_pct_24h: -0.05 },
    { pair: 'BTC/USD', rate: 65420.00, change_pct_24h: 1.82 },
  ];

  // Repeat for continuous seamless marquee
  const looped = [...displayRates, ...displayRates, ...displayRates];

  return (
    <div className="w-full bg-[#050b17] border-b border-[#1c2a47] py-2 overflow-hidden relative select-none">
      <div className="absolute left-0 top-0 bottom-0 z-10 w-28 bg-linear-to-r from-[#050b17] via-[#050b17]/80 to-transparent pointer-events-none flex items-center pl-3">
        <span className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider font-semibold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
          <Radio className="w-2.5 h-2.5 animate-pulse text-cyan-400" />
          FEED
        </span>
      </div>
      <div className="absolute right-0 top-0 bottom-0 z-10 w-16 bg-linear-to-l from-[#050b17] to-transparent pointer-events-none" />

      <div className="ticker-scroll flex items-center gap-6 text-xs whitespace-nowrap pl-28">
        {looped.map((r, idx) => {
          const isPos = r.change_pct_24h >= 0;
          return (
            <div
              key={`${r.pair}-${idx}`}
              onClick={() => setSelectedPair(r.pair)}
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#0c1527]/80 hover:bg-[#14213d] border border-[#1c2a47]/60 hover:border-cyan-500/40 cursor-pointer transition-all duration-150"
            >
              <span className="font-semibold text-slate-200 tracking-wide font-mono text-[11px]">{r.pair}</span>
              <span className="font-mono text-slate-100 font-bold">{r.rate.toFixed(4)}</span>
              <span
                className={`inline-flex items-center text-[10px] font-mono px-1 rounded ${
                  isPos ? 'text-emerald-400 bg-emerald-950/60' : 'text-rose-400 bg-rose-950/60'
                }`}
              >
                {isPos ? <TrendingUp className="w-2.5 h-2.5 mr-0.5 inline" /> : <TrendingDown className="w-2.5 h-2.5 mr-0.5 inline" />}
                {isPos ? '+' : ''}
                {r.change_pct_24h.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
