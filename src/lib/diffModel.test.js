import { diffLines } from 'diff';
import { describe, expect, it } from 'vitest';
import { buildDiffModel, splitLines } from './diffModel';

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
