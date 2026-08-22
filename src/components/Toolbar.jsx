import { RefreshCw } from 'lucide-react';
import { motion as Motion } from 'motion/react';

export default function Toolbar({ granularity, onGranularityChange, hasDiff, onClearAll }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative bg-inklight border border-inkborder rounded-md p-1 flex gap-1">
        <Motion.div
          layout
          layoutId="granularity-pill"
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          className="absolute inset-y-1 rounded-md bg-signal"
          style={{
            width: 'calc(50% - 4px)',
            left: granularity === 'lines' ? '4px' : 'calc(50% + 0px)',
          }}
        />
        <button
          onClick={() => onGranularityChange('lines')}
          className={`relative z-10 px-5 flex items-center justify-center gap-2 py-2.5 rounded-md font-semibold text-sm transition-colors ${
            granularity === 'lines' ? 'text-ink' : 'text-muted hover:text-bone'
          }`}
        >
          Lines
        </button>
        <button
          onClick={() => onGranularityChange('words')}
          className={`relative z-10 px-5 flex items-center justify-center gap-2 py-2.5 rounded-md font-semibold text-sm transition-colors ${
            granularity === 'words' ? 'text-ink' : 'text-muted hover:text-bone'
          }`}
        >
          Words
        </button>
      </div>
      {hasDiff && (
        <button
          onClick={onClearAll}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-md bg-inklight hover:border-bone/40 border border-inkborder text-bone/80 text-sm font-semibold transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Clear all
        </button>
      )}
    </div>
  );
}
