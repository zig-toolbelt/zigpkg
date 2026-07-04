import { loadDocs } from '$lib/docs/server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	return { docs: loadDocs() };
};
