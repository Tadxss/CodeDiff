import { useState, useMemo, useEffect, useRef, Fragment } from 'react';
import { diffLines, diffWords } from 'diff';
import {
  GitCompare, FileText, RefreshCw, Mail, Code, Zap, Heart, Plus, Minus,
  Copy, Check, ChevronUp, ChevronDown, ArrowRight, ArrowLeft, Upload,
} from 'lucide-react';
import BuyMeACoffee from './BuyMeACoffee';
import ContactModal from './ContactModal';

// ─── helpers ────────────────────────────────────────────────────────────────

const FILE_ACCEPT = '.txt,.md,.markdown,.json,.csv,.log,.js,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.h,.cs,.go,.rb,.php,.css,.scss,.html,.xml,.yml,.yaml,.sql,.sh,.docx,text/plain';

/** Read a text-based file, or extract raw text from a .docx, and return its contents as a string */
async function readTextFromFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext === 'docx') {
    const [{ default: mammoth }, arrayBuffer] = await Promise.all([
      import('mammoth/mammoth.browser'),
      file.arrayBuffer(),
    ]);
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }
  return file.text();
}

/** Split a diff-part value into individual lines, dropping the trailing empty line from a final \n */
function splitLines(value) {
  const lines = value.split('\n');
  if (lines[lines.length - 1] === '') lines.pop();
  return lines;
}

/**
 * Turn diffLines() output into a sequence of blocks:
 * - context blocks: unchanged lines, shown on both sides
 * - hunk blocks: paired removed/added lines, padded to equal row count,
 *   each carrying the diffResult indices it was built from (for merging)
 */
function buildDiffModel(diffResult) {
  const blocks = [];
  let leftNum = 1;
  let rightNum = 1;
  let hunkId = 0;
  let i = 0;

  while (i < diffResult.length) {
    const part = diffResult[i];
    if (!part.added && !part.removed) {
      const lines = splitLines(part.value);
      const rows = lines.map((text) => ({ leftNum: leftNum++, rightNum: rightNum++, text }));
      blocks.push({ type: 'context', rows });
      i += 1;
    } else {
      const partIndices = [];
      const removedLines = [];
      const addedLines = [];
      while (i < diffResult.length && (diffResult[i].added || diffResult[i].removed)) {
        partIndices.push(i);
        if (diffResult[i].removed) removedLines.push(...splitLines(diffResult[i].value));
        if (diffResult[i].added) addedLines.push(...splitLines(diffResult[i].value));
        i += 1;
      }
      const rowCount = Math.max(removedLines.length, addedLines.length);
      const rows = [];
      for (let r = 0; r < rowCount; r += 1) {
        rows.push({
          leftNum: r < removedLines.length ? leftNum++ : null,
          rightNum: r < addedLines.length ? rightNum++ : null,
          leftText: r < removedLines.length ? removedLines[r] : null,
          rightText: r < addedLines.length ? addedLines[r] : null,
        });
      }
      blocks.push({
        id: hunkId++,
        type: 'hunk',
        partIndices,
        rows,
        removedText: removedLines.join('\n'),
        addedText: addedLines.join('\n'),
      });
    }
  }
  return blocks;
}

const hatchLeft = { backgroundImage: 'repeating-linear-gradient(45deg, rgba(248,113,113,0.07) 0 6px, transparent 6px 12px)' };
const hatchRight = { backgroundImage: 'repeating-linear-gradient(45deg, rgba(74,222,128,0.07) 0 6px, transparent 6px 12px)' };

// ─── component ───────────────────────────────────────────────────────────────

export default function DiffChecker() {
  const [granularity, setGranularity] = useState('lines'); // 'lines' | 'words'
  const [showContact, setShowContact] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [currentHunk, setCurrentHunk] = useState(0);
  const hunkRefs = useRef({});
  const originalFileRef = useRef(null);
  const changedFileRef = useRef(null);
  const [fileError, setFileError] = useState(null);

  // Set page title
  useEffect(() => {
    document.title = 'CodeDiff — Free Online Text & Code Diff Checker';
  }, []);

  const [originalText, setOriginalText] = useState('');
  const [changedText, setChangedText] = useState('');

  const linesDiff = useMemo(() => diffLines(originalText, changedText), [originalText, changedText]);
  const diffModel = useMemo(() => buildDiffModel(linesDiff), [linesDiff]);
  const hunks = useMemo(() => diffModel.filter((b) => b.type === 'hunk'), [diffModel]);

  const wordsDiff = useMemo(() => (
    granularity === 'words' ? diffWords(originalText, changedText) : []
  ), [originalText, changedText, granularity]);

  useEffect(() => {
    setCurrentHunk((prev) => Math.min(prev, Math.max(0, hunks.length - 1)));
  }, [hunks.length]);

  const stats = useMemo(() => {
    if (granularity === 'lines') {
      let additions = 0;
      let removals = 0;
      hunks.forEach((h) => {
        additions += h.rows.filter((r) => r.rightText !== null).length;
        removals += h.rows.filter((r) => r.leftText !== null).length;
      });
      return { additions, removals };
    }
    let additions = 0;
    let removals = 0;
    wordsDiff.forEach((part) => {
      const count = part.value.split(/\s+/).filter(Boolean).length;
      if (part.added) additions += count;
      if (part.removed) removals += count;
    });
    return { additions, removals };
  }, [granularity, hunks, wordsDiff]);

  const resetOriginal = () => setOriginalText('');
  const resetChanged = () => setChangedText('');
  const clearAll = () => { setOriginalText(''); setChangedText(''); };

  const handleOpenFile = async (e, setText) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setFileError(null);
    try {
      const text = await readTextFromFile(file);
      setText(text);
    } catch {
      setFileError('Could not read that file. Try a plain text file (.txt, .md, .json, code, …) or a .docx document.');
    }
  };

  const hasDiff = originalText.length > 0 || changedText.length > 0;

  const copyText = (key, text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  };

  /** Merge a hunk's changed content into the original text (accept the change) */
  const acceptHunk = (hunk) => {
    const set = new Set(hunk.partIndices);
    const newOriginal = linesDiff.map((part, idx) => {
      if (set.has(idx)) return part.added ? part.value : '';
      return part.added ? '' : part.value;
    }).join('');
    setOriginalText(newOriginal);
  };

  /** Merge a hunk's original content into the changed text (revert the change) */
  const revertHunk = (hunk) => {
    const set = new Set(hunk.partIndices);
    const newChanged = linesDiff.map((part, idx) => {
      if (set.has(idx)) return part.removed ? part.value : '';
      return part.removed ? '' : part.value;
    }).join('');
    setChangedText(newChanged);
  };

  const goToHunk = (index) => {
    if (hunks.length === 0) return;
    const clamped = Math.max(0, Math.min(index, hunks.length - 1));
    setCurrentHunk(clamped);
    hunkRefs.current[hunks[clamped].id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const copyBtnClass = (key) => `flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
    copiedKey === key ? 'bg-green-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
  }`;

  // ─── render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">

      {/* ── Sticky Header ───────────────────────────────────────────────── */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GitCompare className="w-7 h-7 text-blue-400" />
            <div className="text-left">
              <h1 className="text-xl font-bold text-white leading-tight">CodeDiff</h1>
              <p className="text-xs text-slate-400">Compare text instantly — nothing leaves your browser</p>
            </div>
          </div>
          <span className="hidden sm:block text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full">
            🔒 100% private · runs locally
          </span>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-5 space-y-4">

        {/* Toolbar: granularity switcher + clear */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-800 rounded-xl p-1 flex gap-1 shadow-2xl">
            <button
              onClick={() => setGranularity('lines')}
              className={`px-5 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                granularity === 'lines'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Lines
            </button>
            <button
              onClick={() => setGranularity('words')}
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
              onClick={clearAll}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold shadow-2xl transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Clear all
            </button>
          )}
        </div>

        {/* ── Diff result (lines) ─────────────────────────────────────── */}
        {hasDiff && granularity === 'lines' && (
          <div className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-red-400 font-semibold text-sm">
                  <Minus className="w-4 h-4" /> {stats.removals} removal{stats.removals === 1 ? '' : 's'}
                </span>
                <button onClick={() => copyText('all-left', originalText)} className={copyBtnClass('all-left')}>
                  {copiedKey === 'all-left' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'all-left' ? 'Copied!' : 'Copy'}
                </button>
              </div>

              {hunks.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-slate-300 order-last w-full justify-center sm:order-none sm:w-auto">
                  <span className="font-semibold">Change {currentHunk + 1} of {hunks.length}</span>
                  <button
                    onClick={() => goToHunk(currentHunk - 1)}
                    disabled={currentHunk <= 0}
                    title="Previous change"
                    className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => goToHunk(currentHunk + 1)}
                    disabled={currentHunk >= hunks.length - 1}
                    title="Next change"
                    className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button onClick={() => copyText('all-right', changedText)} className={copyBtnClass('all-right')}>
                  {copiedKey === 'all-right' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'all-right' ? 'Copied!' : 'Copy'}
                </button>
                <span className="flex items-center gap-1.5 text-green-400 font-semibold text-sm">
                  <Plus className="w-4 h-4" /> {stats.additions} addition{stats.additions === 1 ? '' : 's'}
                </span>
              </div>
            </div>

            <div className="max-h-[55vh] overflow-y-auto overflow-x-auto">
              <div className="grid grid-cols-[2.5rem_1fr_2.5rem_1fr] min-w-[480px]">
                {diffModel.map((block, bi) => {
                  if (block.type === 'context') {
                    return block.rows.map((row, ri) => (
                      <Fragment key={`ctx-${bi}-${ri}`}>
                        <span className="text-right pr-2 py-0.5 text-[11px] text-slate-600 select-none">{row.leftNum}</span>
                        <span className="px-3 py-0.5 border-r border-slate-700 font-mono text-xs text-slate-400 whitespace-pre-wrap break-words">
                          {row.text || ' '}
                        </span>
                        <span className="text-right pr-2 py-0.5 text-[11px] text-slate-600 select-none">{row.rightNum}</span>
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
                          <span className="text-right pr-2 py-0.5 text-[11px] text-slate-600 select-none">{row.leftNum ?? ''}</span>
                          <span
                            className={`px-3 py-0.5 border-r border-slate-700 font-mono text-xs whitespace-pre-wrap break-words ${
                              row.leftText !== null ? 'bg-red-500/20 text-red-300' : ''
                            }`}
                            style={row.leftText === null ? hatchLeft : undefined}
                          >
                            {row.leftText !== null ? (row.leftText || ' ') : ''}
                          </span>
                          <span className="text-right pr-2 py-0.5 text-[11px] text-slate-600 select-none">{row.rightNum ?? ''}</span>
                          <span
                            className={`px-3 py-0.5 font-mono text-xs whitespace-pre-wrap break-words ${
                              row.rightText !== null ? 'bg-green-500/20 text-green-300' : ''
                            }`}
                            style={row.rightText === null ? hatchRight : undefined}
                          >
                            {row.rightText !== null ? (row.rightText || ' ') : ''}
                          </span>
                        </Fragment>
                      ))}
                      <div
                        ref={(el) => { hunkRefs.current[block.id] = el; }}
                        className="col-span-4 flex flex-wrap items-center justify-center gap-2 py-2 px-2 bg-slate-900/70 border-y border-slate-700"
                      >
                        <button onClick={() => copyText(`hunk-${block.id}-removed`, block.removedText)} className={copyBtnClass(`hunk-${block.id}-removed`)}>
                          {copiedKey === `hunk-${block.id}-removed` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          Removed
                        </button>
                        <button
                          onClick={() => acceptHunk(block)}
                          title="Replace the original lines with the changed lines"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors"
                        >
                          Merge change <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => revertHunk(block)}
                          title="Replace the changed lines with the original lines"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition-colors"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" /> Merge change
                        </button>
                        <button onClick={() => copyText(`hunk-${block.id}-added`, block.addedText)} className={copyBtnClass(`hunk-${block.id}-added`)}>
                          {copiedKey === `hunk-${block.id}-added` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          Added
                        </button>
                      </div>
                    </Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Diff result (words) ─────────────────────────────────────── */}
        {hasDiff && granularity === 'words' && (
          <div className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-slate-200 text-sm">Diff result</span>
              </div>
              <span className="text-sm flex items-center gap-3">
                <span className="flex items-center gap-1 text-green-400 font-mono">
                  <Plus className="w-3.5 h-3.5" />{stats.additions}
                </span>
                <span className="flex items-center gap-1 text-red-400 font-mono">
                  <Minus className="w-3.5 h-3.5" />{stats.removals}
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
        )}

        {/* ── Input panel ─────────────────────────────────────────────── */}
        {fileError && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {fileError}
          </div>
        )}
        <div className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-700">

            {/* Original */}
            <div className="flex flex-col">
              <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span className="font-semibold text-slate-200">Original text</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => originalFileRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" /> Open file
                  </button>
                  <input
                    ref={originalFileRef}
                    type="file"
                    accept={FILE_ACCEPT}
                    className="hidden"
                    onChange={(e) => handleOpenFile(e, setOriginalText)}
                  />
                  {originalText && (
                    <button
                      onClick={resetOriginal}
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Clear
                    </button>
                  )}
                </div>
              </div>
              <div className="p-5 flex-1">
                <textarea
                  value={originalText}
                  onChange={(e) => setOriginalText(e.target.value)}
                  placeholder="Paste the original text or code here… or use Open file above"
                  className="w-full h-[45vh] min-h-[300px] bg-slate-950 border border-slate-700 rounded-lg p-3 font-mono text-xs text-slate-300 resize-y focus:outline-none focus:border-blue-500 placeholder:text-slate-600 transition-colors"
                />
              </div>
            </div>

            {/* Changed */}
            <div className="flex flex-col">
              <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span className="font-semibold text-slate-200">Changed text</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => changedFileRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" /> Open file
                  </button>
                  <input
                    ref={changedFileRef}
                    type="file"
                    accept={FILE_ACCEPT}
                    className="hidden"
                    onChange={(e) => handleOpenFile(e, setChangedText)}
                  />
                  {changedText && (
                    <button
                      onClick={resetChanged}
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Clear
                    </button>
                  )}
                </div>
              </div>
              <div className="p-5 flex-1">
                <textarea
                  value={changedText}
                  onChange={(e) => setChangedText(e.target.value)}
                  placeholder="Paste the changed text or code here… or use Open file above"
                  className="w-full h-[45vh] min-h-[300px] bg-slate-950 border border-slate-700 rounded-lg p-3 font-mono text-xs text-slate-300 resize-y focus:outline-none focus:border-blue-500 placeholder:text-slate-600 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── How it works ────────────────────────────────────────────── */}
        <div className="bg-slate-800 rounded-xl p-5 shadow-2xl">
          <h3 className="text-base font-semibold text-blue-400 mb-3">How it works</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
            <div>
              <h4 className="font-semibold text-slate-200 mb-1.5">Comparing text</h4>
              <ul className="space-y-1 text-slate-400">
                <li>• Paste your original text on the left</li>
                <li>• Paste the changed text on the right</li>
                <li>• The diff updates instantly as you type</li>
                <li>• Switch between line-level and word-level diffing</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-200 mb-1.5">Reading the result</h4>
              <ul className="space-y-1 text-slate-400">
                <li>• Step through changes with the Change navigator</li>
                <li>• Copy just a removed or added block</li>
                <li>• Merge a change to accept or revert it instantly</li>
                <li>• Comparison runs 100% in your browser</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── Collab CTA ──────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-900/30 to-pink-900/20 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-semibold text-base">👋 Got an idea or need a developer?</p>
            <p className="text-slate-400 text-sm mt-0.5">I'm open to freelance work, collaborations, and full-time opportunities.</p>
          </div>
          <button
            onClick={() => setShowContact(true)}
            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-purple-900/40 transition-all"
          >
            <Mail className="w-4 h-4" />
            Get in Touch
          </button>
        </div>

        <BuyMeACoffee />
      </main>

      <ContactModal isOpen={showContact} onClose={() => setShowContact(false)} />

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-slate-950 border-t border-slate-800 mt-8">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Developer */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                <Code className="w-5 h-5 text-blue-400" />
                <span className="text-lg font-semibold text-slate-200">Developed by</span>
              </div>
              <a
                href="https://daryljohntadeo.space"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl font-bold text-blue-400 mb-2 hover:text-blue-300 transition-colors inline-block"
              >
                Daryl John Tadeo
              </a>
              <p className="text-slate-400 text-sm">Full Stack Developer & UI/UX Enthusiast</p>
            </div>

            {/* Built with */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-pink-400" />
                <span className="text-lg font-semibold text-slate-200">Built with</span>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">React</span>
                <span className="bg-cyan-600 text-white px-3 py-1 rounded-full text-sm font-medium">Tailwind CSS</span>
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">Lucide Icons</span>
                <span className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-medium">Vite</span>
                <span className="bg-teal-600 text-white px-3 py-1 rounded-full text-sm font-medium">Netlify</span>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right">
              <div className="flex items-center justify-center md:justify-end gap-2 mb-3">
                <Heart className="w-5 h-5 text-red-400" />
                <span className="text-lg font-semibold text-slate-200">Made with Care</span>
              </div>
              <p className="text-slate-400 text-sm mb-2">© {new Date().getFullYear()} Daryl John Tadeo</p>
              <p className="text-slate-500 text-xs">🔒 Your text never leaves your device, ever</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-slate-400 text-sm">
                Free text & code diff checker — zero uploads, zero tracking, zero data leakage
              </div>
              <div className="text-slate-500 text-xs">
                Version 1.0 · Open Source
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
