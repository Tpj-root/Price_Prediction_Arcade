import React from 'react';
import { GunType } from '../types/game';

interface GameHudProps {
  money: number;
  startingMoney: number;
  currentPrice: number;
  gunType: GunType;
  predictionSeconds: number;
  shots: number;
  hits: number;
  misses: number;
  streak: number;
  maxStreak: number;
  currentIndex: number;
  totalPoints: number;
  showPresentOnly: boolean;
  onTogglePresentOnly: () => void;
}

export const GameHud: React.FC<GameHudProps> = ({
  money,
  startingMoney,
  currentPrice,
  gunType,
  predictionSeconds,
  shots,
  hits,
  misses,
  streak,
  currentIndex,
  totalPoints,
  showPresentOnly,
  onTogglePresentOnly
}) => {
  const pnl = money - startingMoney;
  const pnlPercent = ((pnl / startingMoney) * 100).toFixed(1);
  const accuracy = shots > 0 ? ((hits / shots) * 100).toFixed(1) : '0.0';

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-slate-200">
      {/* Primary Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center border-b border-slate-800 pb-3 mb-3">
        {/* Balance & P&L */}
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-400 font-mono">Portfolio Capital</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-white">
              ${money.toLocaleString()}
            </span>
            <span
              className={`text-xs font-mono font-medium ${
                pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {pnl >= 0 ? `+${pnl}` : pnl} ({pnlPercent}%)
            </span>
          </div>
        </div>

        {/* Live Present Price */}
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-400 font-mono">Present Price</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-sky-400">
              ${currentPrice.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-slate-400">
              Tick #{currentIndex}
            </span>
          </div>
        </div>

        {/* Active Gun Prediction Mode */}
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-400 font-mono">Gun Prediction</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className={`px-2.5 py-1 text-xs font-mono font-bold rounded ${
                gunType === 'RED'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}
            >
              {gunType === 'RED' ? '▲ BULLISH (RED / UP)' : '▼ BEARISH (GREEN / DOWN)'}
            </span>
          </div>
        </div>

        {/* Prediction Horizon & Streak */}
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-mono">Horizon & Streak</div>
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-lg font-bold text-amber-400">
                {predictionSeconds}s
              </span>
              {streak > 0 && (
                <span className="text-xs font-bold text-emerald-400">
                  🔥 {streak}x Streak
                </span>
              )}
            </div>
          </div>
          
          {/* Present Point Mode Toggle */}
          <button
            onClick={onTogglePresentOnly}
            title="Toggle between Present Point Only and Future Curve Preview"
            className={`text-xs font-mono px-2.5 py-1 rounded border transition-colors cursor-pointer ${
              showPresentOnly
                ? 'bg-sky-500/20 border-sky-500/40 text-sky-300 hover:bg-sky-500/30'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            {showPresentOnly ? 'Present Only: ON' : 'Future Curve: Visible'}
          </button>
        </div>
      </div>

      {/* Secondary Performance Metadata (Anti-slop clean unboxed separators) */}
      <div className="flex flex-wrap items-center justify-between gap-y-2 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-3">
          <span>SHOTS <strong className="text-white tabular-nums">{shots}</strong></span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>HITS <strong className="text-emerald-400 tabular-nums">{hits}</strong></span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>MISSES <strong className="text-rose-400 tabular-nums">{misses}</strong></span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>ACCURACY <strong className="text-amber-400 tabular-nums">{accuracy}%</strong></span>
        </div>

        <div className="flex items-center gap-3">
          <span>PROGRESS <strong className="text-slate-300 tabular-nums">{currentIndex}</strong> / <strong className="text-slate-300 tabular-nums">{totalPoints - 1}</strong></span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-slate-500">1 TICK = 1 SEC</span>
        </div>
      </div>
    </div>
  );
};
