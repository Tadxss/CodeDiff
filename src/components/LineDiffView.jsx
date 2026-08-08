import { Fragment } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Minus,
  Plus,
} from 'lucide-react';

const hatchLeft = {
  backgroundImage:
    'repeating-linear-gradient(45deg, rgba(248,113,113,0.07) 0 6px, transparent 6px 12px)',
};
const hatchRight = {
  backgroundImage:
    'repeating-linear-gradient(45deg, rgba(74,222,128,0.07) 0 6px, transparent 6px 12px)',
};

function copyBtnClass(key, copiedKey) {
  return `flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
    copiedKey === key ? 'bg-green-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
  }`;
}

export default function LineDiffView({
  diffModel,
  hunks,
  stats,
  currentHunk,
  onGoToHunk,
  markers,
  diffScrollRef,
  hunkRefs,
  copiedKey,
  onCopy,
  onAccept,
  onRevert,
  originalText,
  changedText,
}) {
  return (
    <div className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-red-400 font-semibold text-sm">
            <Minus className="w-4 h-4" /> {stats.removals} removal{stats.removals === 1 ? '' : 's'}
          </span>
          <button
            onClick={() => onCopy('all-left', originalText)}
            className={copyBtnClass('all-left', copiedKey)}
          >
            {copiedKey === 'all-left' ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copiedKey === 'all-left' ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {hunks.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-slate-300 order-last w-full justify-center sm:order-none sm:w-auto">
            <span className="font-semibold">
              Change {currentHunk + 1} of {hunks.length}
            </span>
            <button
              onClick={() => onGoToHunk(currentHunk - 1)}
              disabled={currentHunk <= 0}
              title="Previous change"
              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => onGoToHunk(currentHunk + 1)}
              disabled={currentHunk >= hunks.length - 1}
              title="Next change"
              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => onCopy('all-right', changedText)}
            className={copyBtnClass('all-right', copiedKey)}
          >
            {copiedKey === 'all-right' ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copiedKey === 'all-right' ? 'Copied!' : 'Copy'}
          </button>
          <span className="flex items-center gap-1.5 text-green-400 font-semibold text-sm">
            <Plus className="w-4 h-4" /> {stats.additions} addition
            {stats.additions === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      <div className="flex">
        <div
          ref={diffScrollRef}
          className="flex-1 min-w-0 max-h-[55vh] overflow-y-auto overflow-x-auto"
        >
          <div className="grid grid-cols-[2.5rem_1fr_2.5rem_1fr] min-w-[480px]">
            {diffModel.map((block, bi) => {
              if (block.type === 'context') {
                return block.rows.map((row, ri) => (
                  <Fragment key={`ctx-${bi}-${ri}`}>
                    <span className="text-right pr-2 py-0.5 text-[11px] text-slate-600 select-none">
                      {row.leftNum}
                    </span>
                    <span className="px-3 py-0.5 border-r border-slate-700 font-mono text-xs text-slate-400 whitespace-pre-wrap break-words">
                      {row.text || ' '}
                    </span>
                    <span className="text-right pr-2 py-0.5 text-[11px] text-slate-600 select-none">
                      {row.rightNum}
                    </span>
                    <span className="px-3 py-0.5 font-mono text-xs text-slate-400 whitespace-pre-wrap break-words">
                      {row.text || ' '}
                    </span>
                  </Fragment>
                ));
              }

              return (
                <Fragment key={`hunk-${block.id}`}>
                  {block.rows.map((row, ri) => (
                    <Fragment key={`hunk-${block.id}-row-${ri}`}>
                      <span className="text-right pr-2 py-0.5 text-[11px] text-slate-600 select-none">
                        {row.leftNum ?? ''}
                      </span>
                      <span
                        className={`px-3 py-0.5 border-r border-slate-700 font-mono text-xs whitespace-pre-wrap break-words ${
                          row.leftText !== null ? 'bg-red-500/20 text-red-300' : ''
                        }`}
                        style={row.leftText === null ? hatchLeft : undefined}
                      >
                        {row.leftText !== null ? row.leftText || ' ' : ''}
                      </span>
                      <span className="text-right pr-2 py-0.5 text-[11px] text-slate-600 select-none">
                        {row.rightNum ?? ''}
                      </span>
                      <span
                        className={`px-3 py-0.5 font-mono text-xs whitespace-pre-wrap break-words ${
                          row.rightText !== null ? 'bg-green-500/20 text-green-300' : ''
                        }`}
                        style={row.rightText === null ? hatchRight : undefined}
                      >
                        {row.rightText !== null ? row.rightText || ' ' : ''}
                      </span>
                    </Fragment>
                  ))}
                  <div
                    ref={(el) => {
                      hunkRefs.current[block.id] = el;
                    }}
                    className="col-span-4 flex flex-wrap items-center justify-center gap-2 py-2 px-2 bg-slate-900/70 border-y border-slate-700"
                  >
                    <button
                      onClick={() => onCopy(`hunk-${block.id}-removed`, block.removedText)}
                      className={copyBtnClass(`hunk-${block.id}-removed`, copiedKey)}
                    >
                      {copiedKey === `hunk-${block.id}-removed` ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      Removed
                    </button>
                    <button
                      onClick={() => onAccept(block)}
                      title="Replace the original lines with the changed lines"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors"
                    >
                      Merge change <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onRevert(block)}
                      title="Replace the changed lines with the original lines"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Merge change
                    </button>
                    <button
                      onClick={() => onCopy(`hunk-${block.id}-added`, block.addedText)}
                      className={copyBtnClass(`hunk-${block.id}-added`, copiedKey)}
                    >
                      {copiedKey === `hunk-${block.id}-added` ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      Added
                    </button>
                  </div>
                </Fragment>
              );
            })}
          </div>
        </div>
        {hunks.length > 0 && (
          <div className="relative w-3 flex-shrink-0 bg-slate-900/60 border-l border-slate-700 rounded-r-lg">
            {markers.map((m) => {
              const idx = hunks.findIndex((h) => h.id === m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => onGoToHunk(idx)}
                  title={`Change ${idx + 1} of ${hunks.length}`}
                  style={{ top: `${m.topPct}%` }}
                  className="absolute left-0 right-0 h-1.5 flex hover:h-2.5 hover:opacity-100 opacity-80 transition-all cursor-pointer"
                >
                  <span className={`flex-1 ${m.hasRemoval ? 'bg-red-500' : ''}`} />
                  <span className={`flex-1 ${m.hasAddition ? 'bg-green-500' : ''}`} />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
