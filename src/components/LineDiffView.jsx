import { memo, useCallback, useState } from 'react';
import { Check, ChevronDown, ChevronRight, ChevronUp, Copy, Minus, Plus } from 'lucide-react';
import { AnimatePresence, motion as Motion } from 'motion/react';
import { List } from 'react-window';

const ROW_GRID = 'grid grid-cols-[2.5rem_1fr_2.5rem_1fr] min-w-[480px] overflow-hidden';
const TEXT_ROW_HEIGHT = 22;
const DIVIDER_ROW_HEIGHT = 28;

function rowHeight(index, { rows }) {
  return rows[index].kind === 'collapseDivider' ? DIVIDER_ROW_HEIGHT : TEXT_ROW_HEIGHT;
}

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
    copiedKey === key
      ? 'bg-signal text-ink'
      : 'bg-inklight hover:border-bone/40 border border-inkborder text-bone/80'
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

const ContextRow = memo(function ContextRow({ row, style }) {
  return (
    <div style={style} className={ROW_GRID}>
      <div className="col-span-2 grid grid-cols-[2.5rem_1fr]">
        <span className="text-right pr-2 py-0.5 text-[11px] text-muted select-none">
          {row.leftNum}
        </span>
        <span className="px-3 py-0.5 border-r border-inkborder font-body text-xs text-muted whitespace-pre-wrap break-words">
          {row.text || ' '}
        </span>
      </div>
      <div className="col-span-2 grid grid-cols-[2.5rem_1fr]">
        <span className="text-right pr-2 py-0.5 text-[11px] text-muted select-none">
          {row.rightNum}
        </span>
        <span className="px-3 py-0.5 font-body text-xs text-muted whitespace-pre-wrap break-words">
          {row.text || ' '}
        </span>
      </div>
    </div>
  );
});

function FloatingIconButton({ icon, isCopied, label, onClick }) {
  const Icon = icon;
  return (
    <Motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex items-center justify-center w-6 h-6 rounded-md border shadow-sm transition-colors ${
        isCopied
          ? 'bg-signal text-ink border-signal'
          : 'bg-ink/90 border-inkborder text-bone/80 hover:border-bone/40 hover:text-bone'
      }`}
    >
      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
    </Motion.button>
  );
}

const HunkRow = memo(function HunkRow({
  row,
  style,
  copiedKey,
  isHunkHovered,
  onHunkEnter,
  onHunkLeave,
  onCopy,
}) {
  const { hunk } = row;
  const showActions = isHunkHovered && row.isFirstRow;
  return (
    <div
      style={style}
      className={ROW_GRID}
      onMouseEnter={() => onHunkEnter(row.hunkId)}
      onMouseLeave={() => onHunkLeave(row.hunkId)}
    >
      <div
        className={`relative col-span-2 grid grid-cols-[2.5rem_1fr] ${
          row.leftText !== null ? 'bg-red-500/20' : ''
        }`}
        style={row.leftText === null ? hatchLeft : undefined}
      >
        <span className="text-right pr-2 py-0.5 text-[11px] text-muted select-none">
          {row.leftNum ?? ''}
        </span>
        <span
          className={`px-3 py-0.5 border-r border-inkborder font-body text-xs whitespace-pre-wrap break-words ${
            row.leftText !== null ? 'text-red-300' : ''
          }`}
        >
          {row.leftText !== null ? row.leftText || ' ' : ''}
        </span>
        {showActions && (
          <span className="absolute top-1 right-1 flex items-center gap-1">
            <FloatingIconButton
              icon={Copy}
              isCopied={copiedKey === `hunk-${hunk.id}-removed`}
              label="Copy removed lines"
              onClick={() => onCopy(`hunk-${hunk.id}-removed`, hunk.removedText)}
            />
          </span>
        )}
      </div>
      <div
        className={`relative col-span-2 grid grid-cols-[2.5rem_1fr] ${
          row.rightText !== null ? 'bg-green-500/20' : ''
        }`}
        style={row.rightText === null ? hatchRight : undefined}
      >
        <span className="text-right pr-2 py-0.5 text-[11px] text-muted select-none">
          {row.rightNum ?? ''}
        </span>
        <span
          className={`px-3 py-0.5 font-body text-xs whitespace-pre-wrap break-words ${
            row.rightText !== null ? 'text-green-300' : ''
          }`}
        >
          {row.rightText !== null ? row.rightText || ' ' : ''}
        </span>
        {showActions && (
          <span className="absolute top-1 right-1 flex items-center gap-1">
            <FloatingIconButton
              icon={Copy}
              isCopied={copiedKey === `hunk-${hunk.id}-added`}
              label="Copy added lines"
              onClick={() => onCopy(`hunk-${hunk.id}-added`, hunk.addedText)}
            />
          </span>
        )}
      </div>
    </div>
  );
});

const CollapseDividerRow = memo(function CollapseDividerRow({ row, style, onToggleCollapse }) {
  const [leftFrom, leftTo] = row.leftRange;
  return (
    <div style={style} className={ROW_GRID}>
      <button
        onClick={() => onToggleCollapse(row.collapseId)}
        className="col-span-4 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold text-muted bg-ink/40 hover:bg-ink/70 border-y border-inkborder transition-colors"
      >
        {row.expanded ? (
          <ChevronDown className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
        {row.expanded
          ? `Hide ${row.hiddenCount} unchanged line${row.hiddenCount === 1 ? '' : 's'}`
          : `Show ${row.hiddenCount} unchanged line${row.hiddenCount === 1 ? '' : 's'}${
              leftFrom != null ? ` (${leftFrom}–${leftTo})` : ''
            }`}
      </button>
    </div>
  );
});

function Row({ index, style, rows, copiedKey, hoveredHunkId, ...callbacks }) {
  const row = rows[index];
  switch (row.kind) {
    case 'context':
      return <ContextRow row={row} style={style} />;
    case 'hunkRow':
      return (
        <HunkRow
          row={row}
          style={style}
          copiedKey={copiedKey}
          isHunkHovered={row.hunkId === hoveredHunkId}
          onHunkEnter={callbacks.onHunkEnter}
          onHunkLeave={callbacks.onHunkLeave}
          onCopy={callbacks.onCopy}
        />
      );
    case 'collapseDivider':
      return (
        <CollapseDividerRow row={row} style={style} onToggleCollapse={callbacks.onToggleCollapse} />
      );
    default:
      return null;
  }
}

export default function LineDiffView({
  flatRows,
  hunks,
  stats,
  currentHunk,
  onGoToHunk,
  markers,
  listRef,
  copiedKey,
  onCopy,
  onToggleCollapse,
  originalText,
  changedText,
}) {
  const [hoveredHunkId, setHoveredHunkId] = useState(null);
  const onHunkEnter = useCallback((hunkId) => setHoveredHunkId(hunkId), []);
  const onHunkLeave = useCallback(
    (hunkId) => setHoveredHunkId((prev) => (prev === hunkId ? null : prev)),
    []
  );

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
        <div className="flex-1 min-w-0 max-h-[55vh] overflow-x-auto">
          <div className="min-w-[480px]" style={{ height: '55vh' }}>
            <List
              listRef={listRef}
              defaultHeight={480}
              rowCount={flatRows.length}
              rowHeight={rowHeight}
              rowComponent={Row}
              rowProps={{
                rows: flatRows,
                copiedKey,
                hoveredHunkId,
                onHunkEnter,
                onHunkLeave,
                onCopy,
                onToggleCollapse,
              }}
              style={{ height: '100%' }}
            />
          </div>
        </div>
        {hunks.length > 0 && (
          <div className="relative w-3 flex-shrink-0 bg-ink/60 border-l border-inkborder rounded-r-lg">
            {markers.map((m) => (
              <button
                key={m.id}
                onClick={() => onGoToHunk(m.index)}
                title={`Change ${m.index + 1} of ${hunks.length}`}
                style={{ top: `${m.topPct}%` }}
                className="absolute left-0 right-0 h-1.5 flex hover:h-2.5 hover:opacity-100 opacity-80 transition-all cursor-pointer"
              >
                <span className={`flex-1 ${m.hasRemoval ? 'bg-red-500' : ''}`} />
                <span className={`flex-1 ${m.hasAddition ? 'bg-green-500' : ''}`} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
