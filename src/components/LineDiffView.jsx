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
import { AnimatePresence, motion as Motion } from 'motion/react';

const hatchLeft = {
  backgroundImage:
    'repeating-linear-gradient(45deg, rgba(248,113,113,0.07) 0 6px, transparent 6px 12px)',
};
const hatchRight = {
  backgroundImage:
    'repeating-linear-gradient(45deg, rgba(74,222,128,0.07) 0 6px, transparent 6px 12px)',
};

function copyBtnClass(key, copiedKey) {
  return `flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
    copiedKey === key ? 'bg-signal text-ink' : 'bg-inklight hover:border-bone/40 border border-inkborder text-bone/80'
  }`;
}

function CopyLabel({ copied, label }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {copied ? (
        <Motion.span
          key="copied"
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.12 }}
          className="flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" /> Copied!
        </Motion.span>
      ) : (
        <Motion.span
          key="idle"
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.12 }}
          className="flex items-center gap-1.5"
        >
          <Copy className="w-3.5 h-3.5" /> {label}
        </Motion.span>
      )}
    </AnimatePresence>
  );
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
    <div className="bg-inklight border border-inkborder rounded-lg overflow-hidden">
      <div className="px-5 py-3 border-b border-inkborder flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-red-400 font-semibold text-sm">
            <Minus className="w-4 h-4" /> {stats.removals} removal{stats.removals === 1 ? '' : 's'}
          </span>
          <Motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => onCopy('all-left', originalText)}
            className={copyBtnClass('all-left', copiedKey)}
          >
            <CopyLabel copied={copiedKey === 'all-left'} label="Copy" />
          </Motion.button>
        </div>

        {hunks.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-bone/80 order-last w-full justify-center sm:order-none sm:w-auto">
            <span className="font-semibold">
              Change {currentHunk + 1} of {hunks.length}
            </span>
            <button
              onClick={() => onGoToHunk(currentHunk - 1)}
              disabled={currentHunk <= 0}
              title="Previous change"
              className="p-1.5 rounded-md bg-inklight border border-inkborder hover:border-bone/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => onGoToHunk(currentHunk + 1)}
              disabled={currentHunk >= hunks.length - 1}
              title="Next change"
              className="p-1.5 rounded-md bg-inklight border border-inkborder hover:border-bone/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => onCopy('all-right', changedText)}
            className={copyBtnClass('all-right', copiedKey)}
          >
            <CopyLabel copied={copiedKey === 'all-right'} label="Copy" />
          </Motion.button>
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
                    <span className="text-right pr-2 py-0.5 text-[11px] text-muted select-none">
                      {row.leftNum}
                    </span>
                    <span className="px-3 py-0.5 border-r border-inkborder font-body text-xs text-muted whitespace-pre-wrap break-words">
                      {row.text || ' '}
                    </span>
                    <span className="text-right pr-2 py-0.5 text-[11px] text-muted select-none">
                      {row.rightNum}
                    </span>
                    <span className="px-3 py-0.5 font-body text-xs text-muted whitespace-pre-wrap break-words">
                      {row.text || ' '}
                    </span>
                  </Fragment>
                ));
              }

              return (
                <Fragment key={`hunk-${block.id}`}>
                  {block.rows.map((row, ri) => (
                    <Fragment key={`hunk-${block.id}-row-${ri}`}>
                      <span className="text-right pr-2 py-0.5 text-[11px] text-muted select-none">
                        {row.leftNum ?? ''}
                      </span>
                      <span
                        className={`px-3 py-0.5 border-r border-inkborder font-body text-xs whitespace-pre-wrap break-words ${
                          row.leftText !== null ? 'bg-red-500/20 text-red-300' : ''
                        }`}
                        style={row.leftText === null ? hatchLeft : undefined}
                      >
                        {row.leftText !== null ? row.leftText || ' ' : ''}
                      </span>
                      <span className="text-right pr-2 py-0.5 text-[11px] text-muted select-none">
                        {row.rightNum ?? ''}
                      </span>
                      <span
                        className={`px-3 py-0.5 font-body text-xs whitespace-pre-wrap break-words ${
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
                    className="col-span-4 flex flex-wrap items-center justify-center gap-2 py-2 px-2 bg-ink/70 border-y border-inkborder"
                  >
                    <Motion.button
                      whileTap={{ scale: 0.94 }}
                      onClick={() => onCopy(`hunk-${block.id}-removed`, block.removedText)}
                      className={copyBtnClass(`hunk-${block.id}-removed`, copiedKey)}
                    >
                      <CopyLabel copied={copiedKey === `hunk-${block.id}-removed`} label="Removed" />
                    </Motion.button>
                    <Motion.button
                      whileTap={{ scale: 0.94 }}
                      onClick={() => onAccept(block)}
                      title="Replace the original lines with the changed lines"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors"
                    >
                      Merge change <ArrowRight className="w-3.5 h-3.5" />
                    </Motion.button>
                    <Motion.button
                      whileTap={{ scale: 0.94 }}
                      onClick={() => onRevert(block)}
                      title="Replace the changed lines with the original lines"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-signal hover:bg-signal/90 text-ink text-xs font-semibold transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Merge change
                    </Motion.button>
                    <Motion.button
                      whileTap={{ scale: 0.94 }}
                      onClick={() => onCopy(`hunk-${block.id}-added`, block.addedText)}
                      className={copyBtnClass(`hunk-${block.id}-added`, copiedKey)}
                    >
                      <CopyLabel copied={copiedKey === `hunk-${block.id}-added`} label="Added" />
                    </Motion.button>
                  </div>
                </Fragment>
              );
            })}
          </div>
        </div>
        {hunks.length > 0 && (
          <div className="relative w-3 flex-shrink-0 bg-ink/60 border-l border-inkborder rounded-r-lg">
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
