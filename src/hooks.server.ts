import type { Handle, HandleServerError } from '@sveltejs/kit';

export const handle: Handle = ({ event, resolve }) => resolve(event);

export const handleError: HandleServerError = ({ error, event }) => {
	const message = error instanceof Error ? error.message : String(error);
	console.error('[handleError]', {
		url: event.url.pathname + event.url.search,
		method: event.request.method,
		message
	});

	return {
		message: 'Something went wrong on our side. Please try again later.'
	};
};
