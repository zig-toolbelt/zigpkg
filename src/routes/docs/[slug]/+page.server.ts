import { error } from '@sveltejs/kit';
import { loadDocs } from '$lib/docs/server';
import { buildCanonical } from '$lib/seo';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const docs = loadDocs();
	const doc = docs.find((d) => d.slug === params.slug);

	if (!doc) {
		error(404, 'Documentation page not found');
	}

	return {
		doc,
		docs,
		seo: {
			title: `${doc.title} - ZigPkg Docs`,
			description: doc.description,
			url: buildCanonical(`/docs/${doc.slug}`)
		}
	};
};
