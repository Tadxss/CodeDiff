import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { collapseContextBlocks, flattenForRender } from '../lib/diffModel';
import LineDiffView from './LineDiffView';

function buildFlatRows({
  contextLength = 10,
  expandedIds = new Set(),
  hunkRows = [{ leftNum: 11, rightNum: 11, leftText: 'old', rightText: 'new' }],
} = {}) {
  const contextRows = Array.from({ length: contextLength }, (_, i) => ({
    leftNum: i + 1,
    rightNum: i + 1,
    text: `unchanged ${i + 1}`,
  }));
  const blocks = [
    { type: 'context', rows: contextRows },
    {
      id: 0,
      type: 'hunk',
      partIndices: [0],
      rows: hunkRows,
      removedText: hunkRows.map((r) => r.leftText).join('\n'),
      addedText: hunkRows.map((r) => r.rightText).join('\n'),
    },
  ];
  const collapsed = collapseContextBlocks(blocks, { threshold: 8, edgeLines: 3 });
  return flattenForRender(collapsed, expandedIds).rows;
}

function baseProps(overrides = {}) {
  return {
    flatRows: buildFlatRows(),
    hunks: [{ id: 0, rows: [{ leftText: 'old', rightText: 'new' }] }],
    stats: { additions: 1, removals: 1 },
    currentHunk: 0,
    onGoToHunk: vi.fn(),
    markers: [{ id: 0, index: 0, topPct: 50, hasRemoval: true, hasAddition: true }],
    listRef: createRef(),
    copiedKey: null,
    onCopy: vi.fn(),
    onToggleCollapse: vi.fn(),
    originalText: 'old',
    changedText: 'new',
    ...overrides,
  };
}

describe('LineDiffView', () => {
  it('clicking the collapse divider calls onToggleCollapse with its id', async () => {
    const onToggleCollapse = vi.fn();
    render(<LineDiffView {...baseProps({ onToggleCollapse })} />);

    await userEvent.click(screen.getByText(/Show \d+ unchanged line/));
    expect(onToggleCollapse).toHaveBeenCalledWith(0);
  });

  it('hovering a hunk row reveals a floating copy button for the added text', async () => {
    const onCopy = vi.fn();
    render(<LineDiffView {...baseProps({ onCopy })} />);

    expect(screen.queryByLabelText('Copy added lines')).not.toBeInTheDocument();

    await userEvent.hover(screen.getByText('new'));
    await userEvent.click(screen.getByLabelText('Copy added lines'));
    expect(onCopy).toHaveBeenCalledWith('hunk-0-added', 'new');
  });

  it('hovering a hunk row reveals a floating copy button for the removed text', async () => {
    const onCopy = vi.fn();
    render(<LineDiffView {...baseProps({ onCopy })} />);

    await userEvent.hover(screen.getByText('old'));
    await userEvent.click(screen.getByLabelText('Copy removed lines'));
    expect(onCopy).toHaveBeenCalledWith('hunk-0-removed', 'old');
  });

  it('shows the copy button once per hunk, anchored to its first row, even when hovering a later row', async () => {
    const hunkRows = [
      { leftNum: 11, rightNum: 11, leftText: 'old1', rightText: 'new1' },
      { leftNum: 12, rightNum: 12, leftText: 'old2', rightText: 'new2' },
      { leftNum: 13, rightNum: 13, leftText: 'old3', rightText: 'new3' },
    ];
    render(<LineDiffView {...baseProps({ flatRows: buildFlatRows({ hunkRows }) })} />);

    await userEvent.hover(screen.getByText('new3'));
    expect(screen.getAllByLabelText('Copy added lines')).toHaveLength(1);
  });

  it('clicking a minimap marker calls onGoToHunk with the precomputed index', async () => {
    const onGoToHunk = vi.fn();
    render(<LineDiffView {...baseProps({ onGoToHunk })} />);

    await userEvent.click(screen.getByTitle('Change 1 of 1'));
    expect(onGoToHunk).toHaveBeenCalledWith(0);
  });

  it('expanding a collapsed section inlines its hidden rows', () => {
    render(<LineDiffView {...baseProps({ flatRows: buildFlatRows({ expandedIds: new Set([0]) }) })} />);
    expect(screen.getAllByText('unchanged 5').length).toBeGreaterThan(0);
  });
});
