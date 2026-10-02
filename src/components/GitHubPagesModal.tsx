import React, { useState } from 'react';
import { PricePoint } from '../types/game';
import { generateSingleFileHtml } from '../utils/singleFileExport';

interface GitHubPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  prices: PricePoint[];
}

export const GitHubPagesModal: React.FC<GitHubPagesModalProps> = ({
  isOpen,
  onClose,
  prices
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleDownloadStandalone = () => {
    const html = generateSingleFileHtml(prices);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'index.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const gitCommands = `# Quick 3-line terminal commands:
git init
git add index.html
git commit -m "Deploy CSV Price Prediction Arcade to GitHub Pages"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/price-arcade.git
git push -u origin main`;

  const handleCopyCommands = () => {
    navigator.clipboard.writeText(gitCommands);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white font-mono">
              Deploy to GitHub Pages (Free Hosting)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Learn what code GitHub Pages supports and deploy in 1 minute.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-mono cursor-pointer px-2"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          
          {/* Explanation */}
          <div className="p-4 bg-sky-950/30 border border-sky-800/60 rounded-lg">
            <h4 className="font-bold text-sky-300 font-mono text-sm mb-1.5">
              Why Python Pygame Cannot Run on GitHub Pages Directly
            </h4>
            <p className="text-slate-300 leading-relaxed">
              GitHub Pages is a <strong>free static web hosting service</strong>. It only executes 
              <span className="text-white font-semibold"> HTML5, CSS, and JavaScript</span> in the player&apos;s browser. 
              Python code (like <code className="text-amber-300">import pygame</code>) requires a native Python runtime and OS window manager, which GitHub Pages servers do not provide.
            </p>
            <p className="text-slate-300 mt-2 leading-relaxed">
              <strong>The Solution:</strong> We converted your entire Pygame loop, canvas rendering, timing math, and sound effects to modern 
              <span className="text-emerald-300 font-semibold"> HTML5 Canvas + Web Audio API</span>. It runs at 60/120 FPS on all browsers, desktops, and mobile devices with zero server installation!
            </p>
          </div>

          {/* 1-Click Download Standalone Option */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h5 className="font-bold text-white font-mono text-sm">Option 1: 1-Click Standalone index.html</h5>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Downloads a single self-contained file with the complete game, sounds, controls, and active CSV embedded.
                </p>
              </div>
              <button
                onClick={handleDownloadStandalone}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono text-xs rounded-lg transition-all shadow-md shadow-emerald-950 cursor-pointer shrink-0"
              >
                Download index.html
              </button>
            </div>
          </div>

          {/* Step-by-Step GitHub Pages Instructions */}
          <div className="space-y-3">
            <h5 className="font-bold text-amber-400 font-mono text-xs uppercase tracking-wider">
              3-Step Deployment Guide for GitHub Pages:
            </h5>
            
            <ol className="space-y-2.5 list-decimal list-inside text-slate-300 leading-relaxed">
              <li>
                <strong>Create a new GitHub Repository:</strong> Go to <span className="text-sky-400">github.com/new</span>, name it <code className="text-amber-300">price-prediction-game</code>, and select <em>Public</em>.
              </li>
              <li>
                <strong>Upload the downloaded <code className="text-white">index.html</code>:</strong> Click &quot;Upload files&quot; on GitHub and drag <code className="text-white">index.html</code> into the repo, then commit changes.
              </li>
              <li>
                <strong>Enable GitHub Pages in Repo Settings:</strong>
                <ul className="list-disc list-inside ml-4 mt-1 text-slate-400 space-y-0.5">
                  <li>Click <strong>Settings</strong> tab &rarr; <strong>Pages</strong> (in left sidebar).</li>
                  <li>Under <strong>Build and deployment &rarr; Branch</strong>: select <code className="text-sky-300">main</code> and <code className="text-sky-300">/(root)</code>.</li>
                  <li>Click <strong>Save</strong>.</li>
                </ul>
              </li>
            </ol>
            
            <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded text-[11px] text-emerald-300 font-mono">
              Your free game will be live at: <span className="underline">https://[your-username].github.io/price-prediction-game/</span>
            </div>
          </div>

          {/* Terminal commands */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono text-slate-400">Terminal Command Alternative:</span>
              <button
                onClick={handleCopyCommands}
                className="text-[11px] font-mono text-sky-400 hover:text-sky-300 cursor-pointer"
              >
                {copied ? '✓ Copied!' : 'Copy Commands'}
              </button>
            </div>
            <pre className="p-3 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] text-slate-300 overflow-x-auto">
              {gitCommands}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-3 border-t border-slate-800 bg-slate-950/40">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
