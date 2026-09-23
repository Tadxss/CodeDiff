import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDiffChecker } from './useDiffChecker';

beforeEach(() => {
  Object.assign(navigator, { clipboard: { writeText: vi.fn(() => Promise.resolve()) } });
});

describe('useDiffChecker', () => {
  it('reports no diff when both sides are empty', () => {
    const { result } = renderHook(() => useDiffChecker());
    expect(result.current.hasDiff).toBe(false);
    expect(result.current.hunks).toHaveLength(0);
  });

  it('builds hunks once the two sides differ', () => {
    const { result } = renderHook(() => useDiffChecker());
    act(() => result.current.setOriginalText('one\ntwo\n'));
    act(() => result.current.setChangedText('one\nTWO\n'));

    expect(result.current.hasDiff).toBe(true);
    expect(result.current.hunks).toHaveLength(1);
    expect(result.current.stats).toEqual({ additions: 1, removals: 1 });
  });

  it('matches git: a line that gains a trailing newline (stops being the last line) counts as changed', () => {
    // Verified against real `git diff`: comparing a file with no trailing newline against
    // one where that same line now has more lines after it shows the line as removed+added,
    // not as unchanged context — because the underlying bytes genuinely differ.
    const { result } = renderHook(() => useDiffChecker());
    act(() => result.current.setOriginalText('https://example.com/job/1'));
    act(() => result.current.setChangedText('https://example.com/job/1\nline2\nline3'));

    expect(result.current.stats).toEqual({ additions: 3, removals: 1 });
  });

  it('matches git: unchanged lines stay unchanged when both sides consistently end with a newline', () => {
    const { result } = renderHook(() => useDiffChecker());
    act(() => result.current.setOriginalText('https://example.com/job/1\n'));
    act(() => result.current.setChangedText('https://example.com/job/1\nline2\nline3\n'));

    expect(result.current.stats).toEqual({ additions: 2, removals: 0 });
    expect(result.current.hunks[0].rows.map((r) => r.rightText)).toEqual(['line2', 'line3']);
  });

  it('clearAll resets both sides', () => {
    const { result } = renderHook(() => useDiffChecker());
    act(() => result.current.setOriginalText('a'));
    act(() => result.current.setChangedText('b'));
    act(() => result.current.clearAll());

    expect(result.current.originalText).toBe('');
    expect(result.current.changedText).toBe('');
  });

  it('resetOriginal and resetChanged clear one side independently', () => {
    const { result } = renderHook(() => useDiffChecker());
    act(() => result.current.setOriginalText('a'));
    act(() => result.current.setChangedText('b'));

    act(() => result.current.resetOriginal());
    expect(result.current.originalText).toBe('');
    expect(result.current.changedText).toBe('b');
  });

  it('goToHunk clamps to the valid hunk range', () => {
    const { result } = renderHook(() => useDiffChecker());
    act(() => result.current.setOriginalText('one\ntwo\nthree\n'));
    act(() => result.current.setChangedText('ONE\ntwo\nTHREE\n'));

    act(() => result.current.goToHunk(99));
    expect(result.current.currentHunk).toBe(result.current.hunks.length - 1);

    act(() => result.current.goToHunk(-5));
    expect(result.current.currentHunk).toBe(0);
  });

  it('computes markers with monotonically increasing positions and sequential indices', () => {
    const { result } = renderHook(() => useDiffChecker());
    act(() =>
      result.current.setOriginalText('one\nkeep1\nkeep2\nkeep3\nkeep4\nkeep5\nkeep6\nkeep7\nkeep8\ntwo\n')
    );
    act(() =>
      result.current.setChangedText('ONE\nkeep1\nkeep2\nkeep3\nkeep4\nkeep5\nkeep6\nkeep7\nkeep8\nTWO\n')
    );

    expect(result.current.markers).toHaveLength(2);
    expect(result.current.markers.map((m) => m.index)).toEqual([0, 1]);
    expect(result.current.markers[0].topPct).toBeLessThan(result.current.markers[1].topPct);
  });

  it('toggleCollapse flips membership in expandedCollapseIds', () => {
    const { result } = renderHook(() => useDiffChecker());
    act(() => result.current.toggleCollapse(0));
    expect(result.current.expandedCollapseIds.has(0)).toBe(true);

    act(() => result.current.toggleCollapse(0));
    expect(result.current.expandedCollapseIds.has(0)).toBe(false);
  });

  it('resets expandedCollapseIds when the diff changes', () => {
    const { result } = renderHook(() => useDiffChecker());
    act(() => result.current.toggleCollapse(0));
    expect(result.current.expandedCollapseIds.has(0)).toBe(true);

    act(() => result.current.setOriginalText('a'));
    expect(result.current.expandedCollapseIds.has(0)).toBe(false);
  });

  it('copyText sets copiedKey then clears it after the timeout', async () => {
    const { result } = renderHook(() => useDiffChecker());
    act(() => result.current.copyText('all-left', 'some text'));

    await waitFor(() => expect(result.current.copiedKey).toBe('all-left'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('some text');

    await waitFor(() => expect(result.current.copiedKey).toBeNull(), { timeout: 3000 });
  });
});
