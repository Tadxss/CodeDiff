import { describe, expect, it, vi } from 'vitest';

vi.mock('mammoth/mammoth.browser', () => ({
  default: {
    extractRawText: vi.fn(async () => ({ value: 'extracted docx text' })),
  },
}));

const { readTextFromFile } = await import('./fileReader');

function makeFile(name, content) {
  return {
    name,
    text: async () => content,
    arrayBuffer: async () => new ArrayBuffer(0),
  };
}

describe('readTextFromFile', () => {
  it('reads plain text files via file.text()', async () => {
    const file = makeFile('notes.txt', 'hello world');
    await expect(readTextFromFile(file)).resolves.toBe('hello world');
  });

  it('reads code files via file.text() regardless of extension', async () => {
    const file = makeFile('script.js', 'console.log(1)');
    await expect(readTextFromFile(file)).resolves.toBe('console.log(1)');
  });

  it('extracts text from .docx files via mammoth', async () => {
    const file = makeFile('document.docx', 'ignored');
    await expect(readTextFromFile(file)).resolves.toBe('extracted docx text');
  });

  it('is case-insensitive about the .docx extension', async () => {
    const file = makeFile('document.DOCX', 'ignored');
    await expect(readTextFromFile(file)).resolves.toBe('extracted docx text');
  });
});
