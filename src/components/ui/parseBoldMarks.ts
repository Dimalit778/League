const BOLD_MARK = /\*\*(.+?)\*\*/g;

export type BoldMarkPart = { type: 'text' | 'bold'; value: string };

/** Split a string into plain and **bold** segments for inline rendering. */
export const parseBoldMarks = (text: string): BoldMarkPart[] => {
  const parts: BoldMarkPart[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(BOLD_MARK)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, index) });
    }
    parts.push({ type: 'bold', value: match[1] ?? '' });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return parts;
};
