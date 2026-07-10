import type { Handle, HandleServerError } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { handle as authHandle } from './auth';

const appHandle: Handle = ({ event, resolve }) => resolve(event);

export const handle = sequence(authHandle, appHandle);

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
