import { diffLines } from 'diff';
import { describe, expect, it } from 'vitest';
import { buildDiffModel, collapseContextBlocks, flattenForRender, splitLines } from './diffModel';

describe('splitLines', () => {
  it('drops the trailing empty line produced by a final newline', () => {
    expect(splitLines('a\nb\n')).toEqual(['a', 'b']);
  });

  it('keeps a trailing non-empty line', () => {
    expect(splitLines('a\nb')).toEqual(['a', 'b']);
  });

  it('handles a single line with no newline', () => {
    expect(splitLines('a')).toEqual(['a']);
  });
});

describe('buildDiffModel', () => {
  it('produces a single context block when there is no diff', () => {
    const result = diffLines('a\nb\n', 'a\nb\n');
    const blocks = buildDiffModel(result);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe('context');
    expect(blocks[0].rows).toEqual([
      { leftNum: 1, rightNum: 1, text: 'a' },
      { leftNum: 2, rightNum: 2, text: 'b' },
    ]);
  });

  it('pads a hunk to the larger of removed/added row counts', () => {
    const result = diffLines('one\ntwo\n', 'one\nTWO\nthree\n');
    const blocks = buildDiffModel(result);
    const hunk = blocks.find((b) => b.type === 'hunk');

    expect(hunk.rows).toHaveLength(2);
    expect(hunk.rows[0]).toEqual({ leftNum: 2, rightNum: 2, leftText: 'two', rightText: 'TWO' });
    expect(hunk.rows[1]).toEqual({
      leftNum: null,
      rightNum: 3,
      leftText: null,
      rightText: 'three',
    });
  });

  it('tracks the diffResult indices a hunk was built from', () => {
    const result = diffLines('a\n', 'b\n');
    const blocks = buildDiffModel(result);
    const hunk = blocks.find((b) => b.type === 'hunk');
    expect(hunk.partIndices).toEqual(
      result.map((_, i) => i).filter((i) => result[i].added || result[i].removed)
    );
  });

  it('assigns sequential ids to multiple hunks', () => {
    const result = diffLines('a\nkeep\nb\n', 'A\nkeep\nB\n');
    const hunks = buildDiffModel(result).filter((b) => b.type === 'hunk');
    expect(hunks.map((h) => h.id)).toEqual([0, 1]);
  });
});

describe('collapseContextBlocks', () => {
  const makeContext = (n) => ({
    type: 'context',
    rows: Array.from({ length: n }, (_, i) => ({
      leftNum: i + 1,
      rightNum: i + 1,
      text: `line${i + 1}`,
    })),
  });

  it('leaves a short context block untouched', () => {
    const blocks = [makeContext(8)];
    expect(collapseContextBlocks(blocks, { threshold: 8, edgeLines: 3 })).toEqual(blocks);
  });

  it('leaves hunk blocks untouched', () => {
    const hunk = { id: 0, type: 'hunk', partIndices: [0], rows: [], removedText: '', addedText: '' };
    expect(collapseContextBlocks([hunk])).toEqual([hunk]);
  });

  it('splits a long context block into edge context + a collapsed divider', () => {
    const blocks = [makeContext(10)];
    const result = collapseContextBlocks(blocks, { threshold: 8, edgeLines: 3 });

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ type: 'context', rows: blocks[0].rows.slice(0, 3) });
    expect(result[1].type).toBe('context-collapsed');
    expect(result[1].id).toBe(0);
    expect(result[1].hiddenRows).toEqual(blocks[0].rows.slice(3, 7));
    expect(result[2]).toEqual({ type: 'context', rows: blocks[0].rows.slice(7) });
  });

  it('assigns independent collapse ids to multiple long context blocks', () => {
    const blocks = [makeContext(10), { id: 0, type: 'hunk', rows: [], partIndices: [] }, makeContext(12)];
    const result = collapseContextBlocks(blocks);
    const dividers = result.filter((b) => b.type === 'context-collapsed');
    expect(dividers.map((d) => d.id)).toEqual([0, 1]);
  });
});

describe('flattenForRender', () => {
  it('flattens context and hunk rows in order, pointing hunkRowIndex at the first hunk row', () => {
    const blocks = [
      { type: 'context', rows: [{ leftNum: 1, rightNum: 1, text: 'a' }] },
      {
        id: 5,
        type: 'hunk',
        rows: [{ leftNum: 2, rightNum: null, leftText: 'b', rightText: null }],
        removedText: 'b',
        addedText: '',
      },
    ];
    const { rows, hunkRowIndex } = flattenForRender(blocks, new Set());

    expect(rows.map((r) => r.kind)).toEqual(['context', 'hunkRow']);
    expect(rows[1].hunk).toBe(blocks[1]);
    expect(hunkRowIndex.get(5)).toBe(1);
  });

  it('inlines hidden rows only when the collapse id is expanded', () => {
    const blocks = [
      {
        type: 'context-collapsed',
        id: 0,
        hiddenRows: [
          { leftNum: 1, rightNum: 1, text: 'a' },
          { leftNum: 2, rightNum: 2, text: 'b' },
        ],
      },
    ];

    const collapsed = flattenForRender(blocks, new Set());
    expect(collapsed.rows.map((r) => r.kind)).toEqual(['collapseDivider']);

    const expanded = flattenForRender(blocks, new Set([0]));
    expect(expanded.rows.map((r) => r.kind)).toEqual(['collapseDivider', 'context', 'context']);
  });
});
