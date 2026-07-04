import { error } from '@sveltejs/kit';
import { loadDocs } from '$lib/docs/server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const docs = loadDocs();
	const doc = docs.find((d) => d.slug === params.slug);

	if (!doc) {
		error(404, 'Documentation page not found');
	}

	return { doc, docs };
};
