import React, { useState } from 'react';
import { MarketDataset, PricePoint } from '../types/game';
import { generateCsvString, parseCsvPrices, PRESET_DATASETS } from '../data/defaultDatasets';

interface CsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDatasetId: string;
  prices: PricePoint[];
  onSelectDataset: (dataset: MarketDataset) => void;
  onLoadCustomPrices: (name: string, prices: PricePoint[]) => void;
}

export const CsvModal: React.FC<CsvModalProps> = ({
  isOpen,
  onClose,
  currentDatasetId,
  prices,
  onSelectDataset,
  onLoadCustomPrices
}) => {
  const [pastedText, setPastedText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      const res = parseCsvPrices(text);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        onLoadCustomPrices(file.name, res.prices);
        onClose();
      }
    };
    reader.readAsText(file);
  };

  const handleApplyPasted = () => {
    setErrorMsg(null);
    if (!pastedText.trim()) {
      setErrorMsg('Please paste CSV content with time and price columns.');
      return;
    }
    const res = parseCsvPrices(pastedText);
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      onLoadCustomPrices('Custom Paste Data', res.prices);
      onClose();
    }
  };

  const handleDownloadCsv = () => {
    const csvContent = generateCsvString(prices);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Game.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white font-mono">Market CSV Datasets</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a simulation feed, upload your own Game.csv, or download the current market series.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-mono cursor-pointer px-2"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 rounded text-xs font-mono">
              {errorMsg}
            </div>
          )}

          {/* 1. Presets */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
              Preset Market Feeds (Built-in)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PRESET_DATASETS.map((ds) => {
                const isActive = currentDatasetId === ds.id;
                return (
                  <button
                    key={ds.id}
                    onClick={() => {
                      onSelectDataset(ds);
                      onClose();
                    }}
                    className={`p-3 text-left rounded-lg border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-sky-950/40 border-sky-500 text-sky-200'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="font-mono font-bold text-xs flex items-center justify-between">
                      <span>{ds.name}</span>
                      {isActive && <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded">ACTIVE</span>}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {ds.description}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-2">
                      {ds.prices.length} data points
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Upload File */}
          <div className="pt-2 border-t border-slate-800">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
              Upload Your Own CSV File (Game.csv)
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
              />
              <button
                onClick={handleDownloadCsv}
                className="w-full sm:w-auto shrink-0 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono border border-slate-700 transition-colors cursor-pointer"
              >
                Download Game.csv
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 font-mono">
              Accepted formats: columns <code className="text-sky-300">time,price</code> or standard timestamp rows.
            </p>
          </div>

          {/* 3. Paste CSV Raw Text */}
          <div className="pt-2 border-t border-slate-800">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
              Or Paste CSV Data Directly
            </label>
            <textarea
              rows={4}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="time,price&#10;0,64200.5&#10;1,64210.2&#10;2,64195.0"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleApplyPasted}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer"
              >
                Parse & Load Pasted CSV
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
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
