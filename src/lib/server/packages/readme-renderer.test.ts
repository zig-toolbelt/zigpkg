import { describe, it, expect } from 'vitest';
import { detectFormat, renderReadme } from '$lib/server/packages/readme-renderer';

describe('detectFormat', () => {
	it('detects markdown extensions', () => {
		expect(detectFormat('README.md')).toBe('markdown');
		expect(detectFormat('README.markdown')).toBe('markdown');
		expect(detectFormat('README.mdown')).toBe('markdown');
		expect(detectFormat('README.mkd')).toBe('markdown');
		expect(detectFormat('README.mkdn')).toBe('markdown');
	});

	it('detects asciidoc extensions (case-insensitive)', () => {
		expect(detectFormat('README.adoc')).toBe('asciidoc');
		expect(detectFormat('README.asciidoc')).toBe('asciidoc');
		expect(detectFormat('README.asc')).toBe('asciidoc');
		expect(detectFormat('README.ad')).toBe('asciidoc');
		expect(detectFormat('README.ADOC')).toBe('asciidoc');
	});

	it('detects rst extensions', () => {
		expect(detectFormat('README.rst')).toBe('rst');
		expect(detectFormat('README.rest')).toBe('rst');
	});

	it('falls back to plaintext for unknown or missing extensions', () => {
		expect(detectFormat('README.txt')).toBe('plaintext');
		expect(detectFormat('README')).toBe('plaintext');
		expect(detectFormat('readme.weird')).toBe('plaintext');
	});
});

describe('renderReadme', () => {
	it('renders markdown to HTML', async () => {
		const html = await renderReadme('README.md', '# Title\n\n**bold**');
		expect(html).toContain('<h1');
		expect(html).toContain('<strong>bold</strong>');
	});

	it('renders asciidoc to HTML and strips ifdef/attribute directives', async () => {
		const adoc = [
			'= Docent',
			':toc: left',
			':doctype: book',
			'ifdef::backend-html5[]',
			'endif::[]',
			'',
			'== Scanning strategy',
			'',
			'Some *bold* text.'
		].join('\n');
		const html = await renderReadme('README.adoc', adoc);
		// Title rendered as visible heading.
		expect(html).toMatch(/<h1[^>]*>Docent<\/h1>/);
		// Section rendered.
		expect(html).toContain('Scanning strategy');
		// AsciiDoc attribute lines must NOT leak as raw text.
		expect(html).not.toContain('ifdef::');
		expect(html).not.toContain(':toc:');
		expect(html).not.toContain(':doctype:');
		// Inline formatting.
		expect(html).toContain('<strong>bold</strong>');
	});

	it('renders asciidoc source blocks with highlightjs classes', async () => {
		const adoc = ['= T', '', '[source,zig]', '----', 'const x = 1;', '----'].join('\n');
		const html = await renderReadme('README.adoc', adoc);
		expect(html).toContain('language-zig');
		expect(html).toContain('hljs');
	});

	it('renders rst to HTML', async () => {
		const rst = ['Title', '=====', '', 'This is **bold**.'].join('\n');
		const html = await renderReadme('README.rst', rst);
		expect(html).toContain('Title');
		expect(html).toContain('<strong>bold</strong>');
	});

	it('renders plaintext inside a <pre> with escaped content', async () => {
		const html = await renderReadme('README.txt', 'a < b & c');
		expect(html).toContain('<pre>');
		expect(html).toContain('&lt;');
		expect(html).toContain('&amp;');
		expect(html).not.toContain('<b>');
	});
});
