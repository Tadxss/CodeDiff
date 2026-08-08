import { GitCompare, Minus, Plus } from 'lucide-react';

export default function WordDiffView({ wordsDiff, stats }) {
  return (
    <div className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-slate-200 text-sm">Diff result</span>
        </div>
        <span className="text-sm flex items-center gap-3">
          <span className="flex items-center gap-1 text-green-400 font-mono">
            <Plus className="w-3.5 h-3.5" />
            {stats.additions}
          </span>
          <span className="flex items-center gap-1 text-red-400 font-mono">
            <Minus className="w-3.5 h-3.5" />
            {stats.removals}
          </span>
        </span>
      </div>
      <pre className="w-full p-4 font-mono text-xs whitespace-pre-wrap break-words max-h-[50vh] overflow-y-auto">
        {wordsDiff.map((part, i) => (
          <span
            key={i}
            className={
              part.added
                ? 'bg-green-500/20 text-green-300'
                : part.removed
                  ? 'bg-red-500/20 text-red-400 line-through'
                  : 'text-slate-300'
            }
          >
            {part.value}
          </span>
        ))}
      </pre>
    </div>
  );
}
