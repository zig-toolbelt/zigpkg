import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import hljsZig from 'highlightjs-zig';
import { convert as asciidocConvert } from '@asciidoctor/core';
import { RstToHtmlCompiler } from 'rst-compiler';

hljs.registerLanguage('zig', hljsZig);

marked.use(
	markedHighlight({
		langPrefix: 'hljs language-',
		highlight(code, lang) {
			const language = hljs.getLanguage(lang) ? lang : 'plaintext';
			return hljs.highlight(code, { language }).value;
		}
	})
);

export type ReadmeFormat = 'markdown' | 'asciidoc' | 'rst' | 'plaintext';

const MARKDOWN_EXTS = new Set(['md', 'markdown', 'mdown', 'mkd', 'mkdn']);
const ASCIIDOC_EXTS = new Set(['adoc', 'asciidoc', 'asc', 'ad']);
const RST_EXTS = new Set(['rst', 'rest', 'restx']);

/** Detect the renderer format from the README filename's extension. */
export function detectFormat(filename: string): ReadmeFormat {
	const ext = filename.toLowerCase().split('.').pop() ?? '';
	if (MARKDOWN_EXTS.has(ext)) return 'markdown';
	if (ASCIIDOC_EXTS.has(ext)) return 'asciidoc';
	if (RST_EXTS.has(ext)) return 'rst';
	return 'plaintext';
}

// Asciidoctor is an Opal-compiled Ruby bundle — instantiating per call is
// wasteful, so we reuse a single converter configured with the same options the
// README pipeline needs. `standalone: false` returns just the inner body HTML
// (no <html>/<head>/<body> wrapper), which is what we want to inject via
// {@html}. `showtitle` promotes the document title to a visible <h1>.
const ASCIIDOC_OPTS = {
	safe: 'secure',
	standalone: false,
	attributes: {
		'source-highlighter': 'highlightjs',
		icons: 'font',
		'skip-front-matter': true,
		showtitle: true
	}
};

// rst-compiler parses to an AST and then generates HTML; the compiler is
// reusable across documents so we keep one instance.
const rstCompiler = new RstToHtmlCompiler();

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

function renderMarkdown(raw: string): string {
	return marked.parse(raw, { gfm: true, async: false }) as string;
}

function renderAsciidoc(raw: string): string {
	return asciidocConvert(raw, ASCIIDOC_OPTS) as unknown as string;
}

function renderRst(raw: string): string {
	const { body } = rstCompiler.compile(raw);
	return body;
}

function renderPlaintext(raw: string): string {
	return `<pre>${escapeHtml(raw)}</pre>`;
}

/**
 * Render a README document to HTML. The format is determined from the
 * filename's extension (markdown / asciidoc / rst / plaintext). The returned
 * HTML is NOT sanitized — callers must run it through DOMPurify before storing
 * or sending it to the client.
 */
export async function renderReadme(filename: string, raw: string): Promise<string> {
	const format = detectFormat(filename);
	switch (format) {
		case 'markdown':
			return renderMarkdown(raw);
		case 'asciidoc':
			return renderAsciidoc(raw);
		case 'rst':
			return renderRst(raw);
		case 'plaintext':
			return renderPlaintext(raw);
	}
}
