import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

export interface DocMeta {
	slug: string;
	title: string;
	eyebrow: string;
	description: string;
	readTime: string;
	icon: string;
	command: string;
	html: string;
}

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
	if (!match) {
		return { meta: {}, body: raw };
	}
	const meta: Record<string, string> = {};
	for (const line of match[1].split('\n')) {
		const idx = line.indexOf(':');
		if (idx > -1) {
			const key = line.slice(0, idx).trim();
			const value = line.slice(idx + 1).trim();
			if (key) meta[key] = value;
		}
	}
	return { meta, body: match[2] };
}

export const DOC_ORDER = [
	'getting-started',
	'package-metadata',
	'publishing-checklist',
	'build-integration',
];

function docOrderIndex(slug: string): number {
	const index = DOC_ORDER.indexOf(slug);
	return index === -1 ? DOC_ORDER.length : index;
}

export function loadDocs(): DocMeta[] {
	const modules = import.meta.glob('./*.md', { query: '?raw', import: 'default', eager: true }) as Record<
		string,
		string
	>;
	const docs: DocMeta[] = [];

	for (const [path, raw] of Object.entries(modules)) {
		const slug = path.split('/').pop()?.replace(/\.md$/, '') ?? '';
		const { meta, body } = parseFrontmatter(raw);
		const rawHtml = marked.parse(body, { gfm: true, async: false }) as string;
		const html = DOMPurify.sanitize(rawHtml);

		docs.push({
			slug,
			title: meta.title ?? slug,
			eyebrow: meta.eyebrow ?? '',
			description: meta.description ?? '',
			readTime: meta.readTime ?? '',
			icon: meta.icon ?? 'book-open',
			command: meta.command ?? '',
			html,
		});
	}

	docs.sort((a, b) => {
		const orderDiff = docOrderIndex(a.slug) - docOrderIndex(b.slug);
		return orderDiff || a.title.localeCompare(b.title);
	});

	return docs;
}
