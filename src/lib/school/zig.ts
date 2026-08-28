export type CodeToken = {
  text: string;
  className: string;
};

export type InlineSegment = {
  text: string;
  code: boolean;
};

const KEYWORDS = new Set([
  "pub",
  "fn",
  "var",
  "const",
  "defer",
  "try",
  "catch",
  "return",
  "if",
  "else",
  "for",
  "while",
  "struct",
  "error",
  "orelse",
  "and",
  "or",
  "comptime",
  "unreachable",
]);

const TYPES = new Set(["void", "bool", "u8", "usize", "Allocator", "Io", "Queue", "Threaded"]);

const TOKEN = /(\/\/[^\n]*)|("(?:\\.|[^"\\])*")|(\.[A-Za-z_]\w*)|(\b\d+\b)|([A-Za-z_]\w*)/g;

function classOf(comment?: string, text?: string, dot?: string, num?: string, ident?: string): string {
  if (comment) return "text-slate-500 italic";
  if (text) return "text-[#a5d6ff]";
  if (dot) return "text-[#d2a8ff]";
  if (num) return "text-[#79c0ff]";
  if (ident && KEYWORDS.has(ident)) return "text-[#ff7b72]";
  if (ident && TYPES.has(ident)) return "text-[#7ee787]";
  return "";
}

export function highlightZig(code: string): CodeToken[] {
  const tokens: CodeToken[] = [];
  let cursor = 0;

  TOKEN.lastIndex = 0;
  for (let match = TOKEN.exec(code); match !== null; match = TOKEN.exec(code)) {
    const [raw, comment, text, dot, num, ident] = match;
    if (match.index > cursor) tokens.push({ text: code.slice(cursor, match.index), className: "" });
    tokens.push({ text: raw, className: classOf(comment, text, dot, num, ident) });
    cursor = match.index + raw.length;
  }

  if (cursor < code.length) tokens.push({ text: code.slice(cursor), className: "" });
  return tokens;
}

export function inlineSegments(text: string): InlineSegment[] {
  return text.split("`").map((chunk, index) => ({ text: chunk, code: index % 2 === 1 }));
}
