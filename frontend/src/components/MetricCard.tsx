import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Sparkline } from './Sparkline';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  changePct?: number;
  icon?: React.ReactNode;
  badge?: string;
  sparklineData?: number[];
  glowColor?: 'cyan' | 'emerald' | 'crimson' | 'amber';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  changePct,
  icon,
  badge,
  sparklineData,
  glowColor = 'cyan',
}) => {
  const isPos = changePct !== undefined ? changePct >= 0 : true;

  const glowBorder = {
    cyan: 'hover:border-cyan-500/50',
    emerald: 'hover:border-emerald-500/50',
    crimson: 'hover:border-rose-500/50',
    amber: 'hover:border-amber-500/50',
  }[glowColor];

  return (
    <div
      className={`glass-panel p-4 rounded-xl border border-[#1c2a47] transition-all duration-200 ${glowBorder} group`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-slate-300 transition-colors">
          {title}
        </span>
        <div className="flex items-center gap-1.5">
          {badge && (
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-800 text-cyan-300">
              {badge}
            </span>
          )}
          {icon && <span className="text-slate-400 group-hover:text-cyan-400 transition-colors">{icon}</span>}
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-2xl font-bold font-mono tracking-tight text-white mb-1">
            {value}
          </div>
          {subtitle && (
            <div className="text-xs text-slate-400 font-medium">
              {subtitle}
            </div>
          )}
        </div>

        {sparklineData && (
          <div className="hidden sm:block">
            <Sparkline data={sparklineData} isPositive={isPos} width={80} height={26} />
          </div>
        )}
      </div>

      {changePct !== undefined && (
        <div className="mt-2.5 pt-2 border-t border-[#1c2a47]/60 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">24h Movement</span>
          <span
            className={`font-mono font-semibold flex items-center gap-0.5 ${
              isPos ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPos ? '+' : ''}{changePct.toFixed(2)}%
          </span>
        </div>
      )}
    </div>
  );
};
