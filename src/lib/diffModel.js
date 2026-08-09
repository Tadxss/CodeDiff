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
