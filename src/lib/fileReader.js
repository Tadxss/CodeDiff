export const FILE_ACCEPT =
  '.txt,.md,.markdown,.json,.csv,.log,.js,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.h,.cs,.go,.rb,.php,.css,.scss,.html,.xml,.yml,.yaml,.sql,.sh,.docx,text/plain';

/** Read a text-based file, or extract raw text from a .docx, and return its contents as a string */
export async function readTextFromFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext === 'docx') {
    const [{ default: mammoth }, arrayBuffer] = await Promise.all([
      import('mammoth/mammoth.browser'),
      file.arrayBuffer(),
    ]);
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }
  return file.text();
}
