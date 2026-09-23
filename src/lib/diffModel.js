/** Split a diff-part value into individual lines, dropping the trailing empty line from a final \n */
export function splitLines(value) {
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
export function buildDiffModel(diffResult) {
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

/**
 * Split long unchanged (context) blocks into edge context + a collapsible
 * "context-collapsed" divider, so huge unchanged runs don't have to be
 * scrolled through. Hunk blocks and short context blocks pass through as-is.
 */
export function collapseContextBlocks(blocks, { threshold = 8, edgeLines = 3 } = {}) {
  let collapseId = 0;
  const result = [];

  blocks.forEach((block) => {
    if (block.type !== 'context' || block.rows.length <= threshold) {
      result.push(block);
      return;
    }
    const { rows } = block;
    result.push({ type: 'context', rows: rows.slice(0, edgeLines) });
    result.push({
      type: 'context-collapsed',
      id: collapseId++,
      hiddenRows: rows.slice(edgeLines, rows.length - edgeLines),
    });
    result.push({ type: 'context', rows: rows.slice(rows.length - edgeLines) });
  });

  return result;
}

/**
 * Flatten collapse-aware blocks into a single array of row descriptors for
 * virtualized rendering, plus a hunkId -> first-row-index map (used for
 * proportional minimap positioning and scroll-to-hunk, both O(1)).
 */
export function flattenForRender(blocks, expandedIds) {
  const rows = [];
  const hunkRowIndex = new Map();
  let hunkIndex = 0;

  blocks.forEach((block, bi) => {
    if (block.type === 'context') {
      block.rows.forEach((row, ri) => {
        rows.push({ kind: 'context', key: `ctx-${bi}-${ri}`, ...row });
      });
      return;
    }

    if (block.type === 'context-collapsed') {
      const expanded = expandedIds.has(block.id);
      const first = block.hiddenRows[0];
      const last = block.hiddenRows[block.hiddenRows.length - 1];
      rows.push({
        kind: 'collapseDivider',
        key: `collapse-${block.id}`,
        collapseId: block.id,
        hiddenCount: block.hiddenRows.length,
        expanded,
        leftRange: first && last ? [first.leftNum, last.leftNum] : [null, null],
        rightRange: first && last ? [first.rightNum, last.rightNum] : [null, null],
      });
      if (expanded) {
        block.hiddenRows.forEach((row, ri) => {
          rows.push({ kind: 'context', key: `collapse-${block.id}-row-${ri}`, ...row });
        });
      }
      return;
    }

    // hunk block
    const thisHunkIndex = hunkIndex++;
    hunkRowIndex.set(block.id, rows.length);
    block.rows.forEach((row, ri) => {
      rows.push({
        kind: 'hunkRow',
        key: `hunk-${block.id}-row-${ri}`,
        hunkId: block.id,
        hunkIndex: thisHunkIndex,
        hunk: block,
        isFirstRow: ri === 0,
        ...row,
      });
    });
  });

  return { rows, hunkRowIndex };
}
