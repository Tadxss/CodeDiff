import { useEffect, useMemo, useRef, useState } from 'react';
import { diffLines, diffWords } from 'diff';
import { buildDiffModel, collapseContextBlocks, flattenForRender } from '../lib/diffModel';
import { readTextFromFile } from '../lib/fileReader';

export function useDiffChecker() {
  const [granularity, setGranularity] = useState('lines'); // 'lines' | 'words'
  const [copiedKey, setCopiedKey] = useState(null);
  const [currentHunk, setCurrentHunk] = useState(0);
  const [expandedCollapseIds, setExpandedCollapseIds] = useState(() => new Set());
  const listRef = useRef(null);
  const originalFileRef = useRef(null);
  const changedFileRef = useRef(null);
  const [fileError, setFileError] = useState(null);
  const [originalText, setOriginalText] = useState('');
  const [changedText, setChangedText] = useState('');

  // Intentionally strict, matching `git diff`'s default behavior: a line that gains or
  // loses its trailing newline (e.g. it stops/starts being the last line of the text) is
  // treated as a real change, not ignored — verified against actual `git diff` output.
  const linesDiff = useMemo(
    () => diffLines(originalText, changedText),
    [originalText, changedText]
  );
  const diffModel = useMemo(() => buildDiffModel(linesDiff), [linesDiff]);
  const hunks = useMemo(() => diffModel.filter((b) => b.type === 'hunk'), [diffModel]);

  const collapsedBlocks = useMemo(
    () => collapseContextBlocks(diffModel, { threshold: 8, edgeLines: 3 }),
    [diffModel]
  );
  const { rows: flatRows, hunkRowIndex } = useMemo(
    () => flattenForRender(collapsedBlocks, expandedCollapseIds),
    [collapsedBlocks, expandedCollapseIds]
  );

  const wordsDiff = useMemo(
    () => (granularity === 'words' ? diffWords(originalText, changedText) : []),
    [originalText, changedText, granularity]
  );

  useEffect(() => {
    setCurrentHunk((prev) => Math.min(prev, Math.max(0, hunks.length - 1)));
  }, [hunks.length]);

  useEffect(() => {
    setExpandedCollapseIds(new Set());
  }, [linesDiff]);

  const markers = useMemo(() => {
    const totalRows = Math.max(1, flatRows.length - 1);
    return hunks.map((h, index) => {
      const rowIndex = hunkRowIndex.get(h.id) ?? 0;
      return {
        id: h.id,
        index,
        topPct: Math.min(100, Math.max(0, (rowIndex / totalRows) * 100)),
        hasRemoval: h.rows.some((r) => r.leftText !== null),
        hasAddition: h.rows.some((r) => r.rightText !== null),
      };
    });
  }, [hunks, flatRows.length, hunkRowIndex]);

  const toggleCollapse = (collapseId) => {
    setExpandedCollapseIds((prev) => {
      const next = new Set(prev);
      if (next.has(collapseId)) next.delete(collapseId);
      else next.add(collapseId);
      return next;
    });
  };

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
  const clearAll = () => {
    setOriginalText('');
    setChangedText('');
  };

  const handleOpenFile = async (e, setText) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setFileError(null);
    try {
      const text = await readTextFromFile(file);
      setText(text);
    } catch {
      setFileError(
        'Could not read that file. Try a plain text file (.txt, .md, .json, code, …) or a .docx document.'
      );
    }
  };

  const hasDiff = originalText.length > 0 || changedText.length > 0;

  const copyText = (key, text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  };

  const goToHunk = (index) => {
    if (hunks.length === 0) return;
    const clamped = Math.max(0, Math.min(index, hunks.length - 1));
    setCurrentHunk(clamped);
    const rowIndex = hunkRowIndex.get(hunks[clamped].id);
    if (rowIndex != null) {
      listRef.current?.scrollToRow({ index: rowIndex, align: 'center', behavior: 'smooth' });
    }
  };

  return {
    granularity,
    setGranularity,
    originalText,
    setOriginalText,
    changedText,
    setChangedText,
    diffModel,
    flatRows,
    hunks,
    wordsDiff,
    stats,
    hasDiff,
    currentHunk,
    goToHunk,
    markers,
    listRef,
    expandedCollapseIds,
    toggleCollapse,
    copiedKey,
    copyText,
    fileError,
    handleOpenFile,
    originalFileRef,
    changedFileRef,
    resetOriginal,
    resetChanged,
    clearAll,
  };
}
