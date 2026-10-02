import React from 'react';
import { GunType } from '../types/game';
import { sound } from '../utils/audio';

interface ArcadeControlsProps {
  gunType: GunType;
  onToggleGun: () => void;
  predictionSeconds: number;
  onSetPredictionSeconds: (sec: number) => void;
  onFire: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onRestart: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
}

export const ArcadeControls: React.FC<ArcadeControlsProps> = ({
  gunType,
  onToggleGun,
  predictionSeconds,
  onSetPredictionSeconds,
  onFire,
  onMoveLeft,
  onMoveRight,
  onRestart,
  isPaused,
  onTogglePause,
  isMuted,
  onToggleMute,
  isMusicPlaying,
  onToggleMusic
}) => {
  const timePresets = [1, 2, 5, 10, 15, 30];

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-300">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Gun Mode & Fire Action */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          {/* Switch Gun Button */}
          <button
            onClick={() => {
              onToggleGun();
              sound.playSwitchGun(gunType === 'RED' ? 'GREEN' : 'RED');
            }}
            className={`flex-1 lg:flex-none px-4 py-2.5 rounded-lg font-mono text-sm font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2 border ${
              gunType === 'RED'
                ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400/50 shadow-rose-950/50'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/50 shadow-emerald-950/50'
            }`}
          >
            <span>{gunType === 'RED' ? '▲ RED (UP)' : '▼ GREEN (DOWN)'}</span>
            <span className="text-xs bg-black/30 px-1.5 py-0.5 rounded font-mono text-white/80">TAB</span>
          </button>

          {/* Fire Cannon Button */}
          <button
            onClick={onFire}
            className="flex-1 lg:flex-none px-6 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold font-mono text-sm rounded-lg transition-all shadow-md shadow-amber-950/40 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>FIRE PREDICTION</span>
            <span className="text-xs bg-black/20 px-1.5 py-0.5 rounded font-mono">SPACE</span>
          </button>
        </div>

        {/* Prediction Time Presets (1s, 2s, 5s, 10s, etc.) */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/80 overflow-x-auto max-w-full">
          <span className="text-xs font-mono text-slate-400 px-2 uppercase tracking-wide shrink-0">
            Time:
          </span>
          {timePresets.map(sec => {
            const isSelected = predictionSeconds === sec;
            return (
              <button
                key={sec}
                onClick={() => {
                  onSetPredictionSeconds(sec);
                  sound.playTimeChange();
                }}
                className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500 text-white font-bold shadow-sm shadow-sky-950'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {sec}s
              </button>
            );
          })}

          {/* Increment / Decrement */}
          <button
            onClick={() => {
              onSetPredictionSeconds(Math.max(1, predictionSeconds - 1));
              sound.playTimeChange();
            }}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono cursor-pointer shrink-0"
            title="Decrease 1s (-)"
          >
            -
          </button>
          <button
            onClick={() => {
              onSetPredictionSeconds(Math.min(100, predictionSeconds + 1));
              sound.playTimeChange();
            }}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono cursor-pointer shrink-0"
            title="Increase 1s (+)"
          >
            +
          </button>
        </div>

        {/* Tactical Controls & Audio Toggles */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          {/* Virtual Steering (Left / Right) for Mobile / Touch */}
          <div className="flex items-center gap-1">
            <button
              onMouseDown={onMoveLeft}
              onTouchStart={onMoveLeft}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 rounded text-xs font-mono cursor-pointer"
              title="Move Turret Left (A / Left Arrow)"
            >
              ◀ A
            </button>
            <button
              onMouseDown={onMoveRight}
              onTouchStart={onMoveRight}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 rounded text-xs font-mono cursor-pointer"
              title="Move Turret Right (D / Right Arrow)"
            >
              D ▶
            </button>
          </div>

          {/* Sound FX Toggle */}
          <button
            onClick={onToggleMute}
            className={`px-3 py-2 rounded text-xs font-mono border transition-colors cursor-pointer ${
              isMuted
                ? 'bg-slate-800 border-slate-700 text-slate-500'
                : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
            }`}
            title="Toggle Sound Effects (M)"
          >
            {isMuted ? '🔇 SFX OFF' : '🔊 SFX ON'}
          </button>

          {/* Ambience Synth Hum */}
          <button
            onClick={onToggleMusic}
            className={`px-3 py-2 rounded text-xs font-mono border transition-colors cursor-pointer ${
              isMusicPlaying
                ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 hover:bg-purple-500/30'
                : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle Synth Ambience"
          >
            {isMusicPlaying ? '🎵 SYNTH ON' : '🎵 SYNTH OFF'}
          </button>

          {/* Pause / Resume */}
          <button
            onClick={onTogglePause}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono border border-slate-700 cursor-pointer"
            title="Pause/Resume Game (P)"
          >
            {isPaused ? '▶ RESUME' : '⏸ PAUSE'}
          </button>

          {/* Restart */}
          <button
            onClick={onRestart}
            className="px-3 py-2 bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 rounded text-xs font-mono border border-rose-800/40 cursor-pointer"
            title="Restart Session (R)"
          >
            ↺ RESET
          </button>
        </div>
      </div>
    </div>
  );
};
