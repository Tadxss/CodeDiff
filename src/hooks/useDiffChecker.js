import { useEffect, useMemo, useRef, useState } from 'react';
import { diffLines, diffWords } from 'diff';
import { buildDiffModel } from '../lib/diffModel';
import { readTextFromFile } from '../lib/fileReader';

export function useDiffChecker() {
  const [granularity, setGranularity] = useState('lines'); // 'lines' | 'words'
  const [copiedKey, setCopiedKey] = useState(null);
  const [currentHunk, setCurrentHunk] = useState(0);
  const hunkRefs = useRef({});
  const diffScrollRef = useRef(null);
  const [markers, setMarkers] = useState([]);
  const originalFileRef = useRef(null);
  const changedFileRef = useRef(null);
  const [fileError, setFileError] = useState(null);
  const [originalText, setOriginalText] = useState('');
  const [changedText, setChangedText] = useState('');

  const linesDiff = useMemo(
    () => diffLines(originalText, changedText),
    [originalText, changedText]
  );
  const diffModel = useMemo(() => buildDiffModel(linesDiff), [linesDiff]);
  const hunks = useMemo(() => diffModel.filter((b) => b.type === 'hunk'), [diffModel]);

  const wordsDiff = useMemo(
    () => (granularity === 'words' ? diffWords(originalText, changedText) : []),
    [originalText, changedText, granularity]
  );

  useEffect(() => {
    setCurrentHunk((prev) => Math.min(prev, Math.max(0, hunks.length - 1)));
  }, [hunks.length]);

  useEffect(() => {
    const computeMarkers = () => {
      const container = diffScrollRef.current;
      if (!container) {
        setMarkers([]);
        return;
      }
      const containerRect = container.getBoundingClientRect();
      const scrollHeight = container.scrollHeight || 1;
      setMarkers(
        hunks
          .map((h) => {
            const node = hunkRefs.current[h.id];
            if (!node) return null;
            const nodeRect = node.getBoundingClientRect();
            const offset = nodeRect.top - containerRect.top + container.scrollTop;
            return {
              id: h.id,
              topPct: Math.min(100, Math.max(0, (offset / scrollHeight) * 100)),
              hasRemoval: h.rows.some((r) => r.leftText !== null),
              hasAddition: h.rows.some((r) => r.rightText !== null),
            };
          })
          .filter(Boolean)
      );
    };
    computeMarkers();
    window.addEventListener('resize', computeMarkers);
    return () => window.removeEventListener('resize', computeMarkers);
  }, [hunks]);

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

  /** Merge a hunk's changed content into the original text (accept the change) */
  const acceptHunk = (hunk) => {
    const set = new Set(hunk.partIndices);
    const newOriginal = linesDiff
      .map((part, idx) => {
        if (set.has(idx)) return part.added ? part.value : '';
        return part.added ? '' : part.value;
      })
      .join('');
    setOriginalText(newOriginal);
  };

  /** Merge a hunk's original content into the changed text (revert the change) */
  const revertHunk = (hunk) => {
    const set = new Set(hunk.partIndices);
    const newChanged = linesDiff
      .map((part, idx) => {
        if (set.has(idx)) return part.removed ? part.value : '';
        return part.removed ? '' : part.value;
      })
      .join('');
    setChangedText(newChanged);
  };

  const goToHunk = (index) => {
    if (hunks.length === 0) return;
    const clamped = Math.max(0, Math.min(index, hunks.length - 1));
    setCurrentHunk(clamped);
    hunkRefs.current[hunks[clamped].id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return {
    granularity,
    setGranularity,
    originalText,
    setOriginalText,
    changedText,
    setChangedText,
    diffModel,
    hunks,
    wordsDiff,
    stats,
    hasDiff,
    currentHunk,
    goToHunk,
    markers,
    diffScrollRef,
    hunkRefs,
    copiedKey,
    copyText,
    fileError,
    handleOpenFile,
    originalFileRef,
    changedFileRef,
    resetOriginal,
    resetChanged,
    clearAll,
    acceptHunk,
    revertHunk,
  };
}
