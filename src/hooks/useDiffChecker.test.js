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

  it('acceptHunk merges the changed content into the original text', () => {
    const { result } = renderHook(() => useDiffChecker());
    act(() => result.current.setOriginalText('one\ntwo\n'));
    act(() => result.current.setChangedText('one\nTWO\n'));

    act(() => result.current.acceptHunk(result.current.hunks[0]));
    expect(result.current.originalText).toBe('one\nTWO\n');
  });

  it('revertHunk merges the original content into the changed text', () => {
    const { result } = renderHook(() => useDiffChecker());
    act(() => result.current.setOriginalText('one\ntwo\n'));
    act(() => result.current.setChangedText('one\nTWO\n'));

    act(() => result.current.revertHunk(result.current.hunks[0]));
    expect(result.current.changedText).toBe('one\ntwo\n');
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

  it('copyText sets copiedKey then clears it after the timeout', async () => {
    const { result } = renderHook(() => useDiffChecker());
    act(() => result.current.copyText('all-left', 'some text'));

    await waitFor(() => expect(result.current.copiedKey).toBe('all-left'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('some text');

    await waitFor(() => expect(result.current.copiedKey).toBeNull(), { timeout: 3000 });
  });
});
