import React from 'react';

interface HeaderProps {
  onOpenCsvModal: () => void;
  onOpenGitHubModal: () => void;
  currentDatasetName: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCsvModal,
  onOpenGitHubModal,
  currentDatasetName
}) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold tracking-tight text-white font-mono">
          Price Prediction Arcade
        </span>
        <span className="hidden sm:inline-block text-[11px] font-mono text-slate-500">
          / {currentDatasetName}
        </span>
      </div>

      {/* Zone 2: Navigation Info / Mode */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-slate-400">
        <span className="text-sky-400">
          Present-Point Radar Active
        </span>
        <span aria-hidden="true" className="text-slate-700">·</span>
        <span>
          Web Audio Synthesizer
        </span>
        <span aria-hidden="true" className="text-slate-700">·</span>
        <span>
          60 FPS HTML5 Engine
        </span>
      </nav>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenCsvModal}
          className="px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors whitespace-nowrap cursor-pointer"
        >
          CSV & Datasets
        </button>
        <button
          onClick={onOpenGitHubModal}
          className="px-3.5 py-1.5 text-xs font-mono font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-sm shadow-emerald-950"
        >
          Deploy to GitHub Pages
        </button>
      </div>
    </header>
  );
};
