import { RefreshCw } from 'lucide-react';

export default function Toolbar({ granularity, onGranularityChange, hasDiff, onClearAll }) {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-slate-800 rounded-xl p-1 flex gap-1 shadow-2xl">
        <button
          onClick={() => onGranularityChange('lines')}
          className={`px-5 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all ${
            granularity === 'lines'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Lines
        </button>
        <button
          onClick={() => onGranularityChange('words')}
          className={`px-5 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all ${
            granularity === 'words'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Words
        </button>
      </div>
      {hasDiff && (
        <button
          onClick={onClearAll}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold shadow-2xl transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Clear all
        </button>
      )}
    </div>
  );
}
